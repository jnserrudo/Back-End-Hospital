import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import validator from "validator";
import { sendRecuperacionEmail, urlFront } from "../../procesoEmail.js";
import { AppError } from "../utils/http.js";
import { ROLES } from "../middlewares/auth.js";
import { validarPasswordNueva } from "./usuario.js";

const prisma = new PrismaClient();

export const MINUTOS_VALIDEZ = 30;
const MAX_POR_CUENTA = 3; // enlaces por cuenta cada 15 minutos
const MAX_CUENTAS = 3; // si un dato coincide con varias cuentas, como máximo avisamos a 3

export const MENSAJE_NEUTRO =
  "Si los datos coinciden con una cuenta activa que tenga email cargado, te mandamos un email con un enlace para crear una contraseña nueva. Revisá tu bandeja de entrada y el correo no deseado. El enlace vence en 30 minutos.";

const hashToken = (t) => crypto.createHash("sha256").update(String(t)).digest("hex");

const cuentaActiva = (u) =>
  u.habilitado === 1 && !(u.idRol === ROLES.PACIENTE && u.paciente && u.paciente.habilitado !== 1);

// Busca cuentas por usuario, email o DNI (en ese orden de coincidencia).
const buscarCuentas = async (identificador) => {
  const id = String(identificador || "").trim();
  if (!id || id.length > 120) return [];
  const OR = [{ usuario: id }];
  if (validator.isEmail(id)) OR.push({ email: id.toLowerCase() }, { email: id });
  const soloNumeros = id.replace(/[.\s-]/g, "");
  if (/^\d{6,9}$/.test(soloNumeros)) OR.push({ dni: +soloNumeros });
  const cuentas = await prisma.usuario.findMany({
    where: { OR },
    select: { id: true, usuario: true, nombre: true, email: true, habilitado: true, idRol: true, paciente: { select: { habilitado: true } } },
    take: 10,
  });
  return cuentas.filter(cuentaActiva).filter((u) => validator.isEmail(u.email || "")).slice(0, MAX_CUENTAS);
};

export class RecuperacionModel {
  /**
   * Genera y envía los enlaces. Se llama DESPUÉS de responder el mensaje neutro,
   * así la respuesta no delata (ni por contenido ni por demora) si la cuenta existe.
   */
  static solicitar = async (identificador, ip) => {
    const cuentas = await buscarCuentas(identificador);
    for (const u of cuentas) {
      const desde = new Date(Date.now() - 15 * 60 * 1000);
      const recientes = await prisma.recuperacionPassword.count({ where: { usuarioId: u.id, createdAt: { gte: desde } } });
      if (recientes >= MAX_POR_CUENTA) {
        console.warn(`[recuperar] Límite de enlaces alcanzado para la cuenta ${u.id}; no se envía otro.`);
        continue;
      }
      const token = crypto.randomBytes(32).toString("base64url");
      await prisma.recuperacionPassword.create({
        data: {
          usuarioId: u.id,
          tokenHash: hashToken(token),
          expiraAt: new Date(Date.now() + MINUTOS_VALIDEZ * 60 * 1000),
          ip: ip ? String(ip).slice(0, 64) : null,
        },
      });
      const enlace = `${urlFront()}/restablecer-contrasena?token=${encodeURIComponent(token)}`;
      const r = await Promise.race([
        sendRecuperacionEmail(u.email, { nombre: u.nombre, usuario: u.usuario, enlace, minutos: MINUTOS_VALIDEZ }),
        new Promise((resolve) => setTimeout(() => resolve({ err: new Error("sin respuesta en 15 s") }), 15000)),
      ]);
      if (r?.err) console.error(`[recuperar] No se pudo enviar el email a la cuenta ${u.id}:`, r.err?.message || r.err);
    }
  };

  // Devuelve el registro válido o un error claro (vencido / usado / inválido).
  static buscarToken = async (token) => {
    if (!token || typeof token !== "string" || token.length < 20 || token.length > 200) {
      throw new AppError(400, "El enlace no es válido. Puede que esté incompleto: pedí uno nuevo.", "TOKEN_INVALIDO");
    }
    const reg = await prisma.recuperacionPassword.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { usuario: { select: { id: true, usuario: true, nombre: true, password: true, habilitado: true, idRol: true, paciente: { select: { habilitado: true } } } } },
    });
    if (!reg || !reg.usuario || !cuentaActiva(reg.usuario)) {
      throw new AppError(400, "El enlace no es válido. Puede que esté incompleto: pedí uno nuevo.", "TOKEN_INVALIDO");
    }
    if (reg.usadoAt) {
      throw new AppError(400, "Este enlace ya se usó (o pediste uno más nuevo). Si todavía necesitás cambiar la contraseña, pedí otro.", "TOKEN_USADO");
    }
    if (reg.expiraAt < new Date()) {
      throw new AppError(400, `Este enlace venció: dura ${MINUTOS_VALIDEZ} minutos. Pedí uno nuevo y usalo apenas te llegue.`, "TOKEN_VENCIDO");
    }
    return reg;
  };

  static verificar = async (token) => {
    const reg = await this.buscarToken(token);
    return { ok: true, nombre: reg.usuario.nombre, usuario: reg.usuario.usuario, venceEn: reg.expiraAt };
  };

  static restablecer = async (token, newPassword) => {
    const reg = await this.buscarToken(token);
    validarPasswordNueva(newPassword);
    if (await bcrypt.compare(String(newPassword), reg.usuario.password)) {
      throw new AppError(400, "La contraseña nueva tiene que ser distinta de la anterior.", "PASSWORD_REPETIDA");
    }
    const hash = await bcrypt.hash(String(newPassword), 10);
    const ahora = new Date();
    await prisma.$transaction(async (tx) => {
      // Marca el enlace como usado solo si nadie lo usó en paralelo.
      const marcado = await tx.recuperacionPassword.updateMany({ where: { id: reg.id, usadoAt: null }, data: { usadoAt: ahora } });
      if (marcado.count !== 1) {
        throw new AppError(400, "Este enlace ya se usó. Si todavía necesitás cambiar la contraseña, pedí otro.", "TOKEN_USADO");
      }
      // Los demás enlaces pendientes de la cuenta dejan de servir.
      await tx.recuperacionPassword.updateMany({ where: { usuarioId: reg.usuarioId, usadoAt: null }, data: { usadoAt: ahora } });
      // Nueva contraseña, sin cambio obligatorio pendiente, y las sesiones abiertas se cierran.
      await tx.usuario.update({ where: { id: reg.usuarioId }, data: { password: hash, blanqueado: 1, passwordChangedAt: ahora } });
    });
    return { ok: true, usuario: reg.usuario.usuario, message: "Listo: ya podés ingresar con tu contraseña nueva." };
  };
}
