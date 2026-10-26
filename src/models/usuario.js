import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import validator from "validator";
import { sendPasswordResetEmail } from "../../procesoEmail.js";
import { AppError } from "../utils/http.js";
import { ROLES, signPasswordChangeToken, signSessionToken } from "../middlewares/auth.js";

const prisma = new PrismaClient();

// Nunca devolvemos el hash de la contraseña.
export const USUARIO_PUBLICO = {
  id: true,
  usuario: true,
  dni: true,
  email: true,
  nombre: true,
  apellido: true,
  detalle: true,
  especialidad: true,
  blanqueado: true,
  habilitado: true,
  idRol: true,
  rol: { select: { id: true, rol: true } },
  paciente: {
    select: {
      id: true,
      habilitado: true,
      patologia: {
        where: { habilitado: 1 },
        select: { patologia: { select: { id: true, nombre: true, habilitado: true } } },
      },
    },
  },
};

const ROL_NOMBRE = { 1: "Administrador", 2: "Profesional de salud", 3: "Paciente" };

// Agrega campos derivados útiles para la UI.
export const presentarUsuario = (u) => {
  if (!u) return u;
  const esPaciente = u.idRol === ROLES.PACIENTE;
  const pacienteHabilitado = !esPaciente || !u.paciente || u.paciente.habilitado === 1;
  return {
    ...u,
    rolNombre: ROL_NOMBRE[u.idRol] || u.rol?.rol || "Sin rol",
    patologias: (u.paciente?.patologia || []).map((p) => p.patologia).filter(Boolean),
    activo: u.habilitado === 1 && pacienteHabilitado,
  };
};

export const enmascararEmail = (email = "") => {
  const [user, domain] = String(email).split("@");
  if (!domain) return email;
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${"*".repeat(Math.max(3, user.length - visible.length))}@${domain}`;
};

const generarPasswordTemporal = () => {
  // 10 caracteres sin caracteres ambiguos, con al menos una letra y un número
  const letras = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";
  const numeros = "23456789";
  const todos = letras + numeros;
  let pwd = letras[crypto.randomInt(letras.length)] + numeros[crypto.randomInt(numeros.length)];
  for (let i = 0; i < 8; i++) pwd += todos[crypto.randomInt(todos.length)];
  return pwd
    .split("")
    .sort(() => crypto.randomInt(3) - 1)
    .join("");
};

export const validarPasswordNueva = (password) => {
  if (!password || typeof password !== "string" || password.length < 8) {
    throw new AppError(400, "La contraseña nueva tiene que tener al menos 8 caracteres.", "PASSWORD_DEBIL");
  }
  if (!/[A-Za-zÑñ]/.test(password) || !/[0-9]/.test(password)) {
    throw new AppError(400, "La contraseña nueva tiene que tener al menos una letra y un número.", "PASSWORD_DEBIL");
  }
};

const limpiarTexto = (v) => (typeof v === "string" ? v.trim() : v);

// Antes de reactivar una cuenta: que no choque con otra cuenta activa (mismo usuario o DNI).
export const verificarConflictosAlHabilitar = async (u, db = prisma) => {
  const otra = await db.usuario.findFirst({
    where: { habilitado: 1, NOT: { id: u.id }, OR: [{ usuario: u.usuario }, ...(u.dni ? [{ dni: u.dni }] : [])] },
    select: { id: true, usuario: true, dni: true, nombre: true, apellido: true },
  });
  if (otra) {
    const motivo = otra.usuario === u.usuario ? `el usuario «${u.usuario}»` : `el DNI ${u.dni}`;
    throw new AppError(
      409,
      `No se puede habilitar: ya hay otra cuenta activa con ${motivo} (${otra.nombre} ${otra.apellido}). Editá o deshabilitá esa cuenta primero.`,
      "CONFLICTO_HABILITAR"
    );
  }
};

// actual: el registro antes de editar. Solo validamos duplicados si el dato cambia,
// así las cuentas viejas que ya estaban repetidas se pueden seguir editando.
const validarDatosBasicos = async (data, { id = null, parcial = false, actual = null } = {}) => {
  const out = {};
  const requerir = (campo, mensaje) => {
    if (!parcial || data[campo] !== undefined) {
      const v = limpiarTexto(data[campo]);
      if (v === undefined || v === null || v === "") throw new AppError(400, mensaje, "DATO_FALTANTE");
      out[campo] = v;
    }
  };
  requerir("nombre", "Ingresá el nombre.");
  requerir("apellido", "Ingresá el apellido.");
  requerir("usuario", "Ingresá el nombre de usuario con el que va a ingresar.");
  requerir("email", "Ingresá el email.");
  if (!parcial || data.dni !== undefined) {
    const dni = String(data.dni ?? "").replace(/\./g, "").trim();
    if (!/^\d{6,10}$/.test(dni)) {
      throw new AppError(400, "El DNI tiene que tener solo números, sin puntos (entre 6 y 10 dígitos).", "DNI_INVALIDO");
    }
    out.dni = +dni;
  }
  if (out.email !== undefined && !validator.isEmail(out.email)) {
    throw new AppError(400, "El email no es válido. Revisalo (por ejemplo nombre@gmail.com).", "EMAIL_INVALIDO");
  }
  if (out.usuario !== undefined) {
    if (/\s/.test(out.usuario)) {
      throw new AppError(400, "El nombre de usuario no puede tener espacios.", "USUARIO_INVALIDO");
    }
    const existe =
      actual?.usuario === out.usuario
        ? null
        : await prisma.usuario.findFirst({
            where: { usuario: out.usuario, ...(id ? { NOT: { id } } : {}) },
            select: { id: true },
          });
    if (existe) {
      throw new AppError(409, `Ya existe otra cuenta con el usuario «${out.usuario}». Elegí otro nombre de usuario.`, "USUARIO_DUPLICADO");
    }
  }
  if (out.dni !== undefined && actual?.dni !== out.dni) {
    const existe = await prisma.usuario.findFirst({
      where: { dni: out.dni, ...(id ? { NOT: { id } } : {}) },
      orderBy: { habilitado: "desc" },
      select: { id: true, nombre: true, apellido: true, habilitado: true, usuario: true },
    });
    if (existe?.habilitado === 1) {
      throw new AppError(409, `Ya existe una cuenta activa con el DNI ${out.dni} (${existe.nombre} ${existe.apellido}). Revisá el número o buscá esa cuenta en la lista.`, "DNI_DUPLICADO");
    }
    if (existe) {
      throw new AppError(
        409,
        `Ya existe una cuenta deshabilitada con el DNI ${out.dni} (${existe.nombre} ${existe.apellido}, usuario «${existe.usuario}»). En lugar de crear otra, volvé a habilitarla desde la lista (filtro «Deshabilitados»).`,
        "DNI_DUPLICADO_DESHABILITADO"
      );
    }
  }
  if (data.detalle !== undefined) out.detalle = String(data.detalle ?? "").trim();
  if (data.especialidad !== undefined) {
    const esp = String(data.especialidad ?? "").replace(/\s+/g, " ").trim();
    if (esp.length > 80) {
      throw new AppError(400, "La especialidad es muy larga: usá hasta 80 caracteres (por ejemplo «Kinesiología»).", "ESPECIALIDAD_LARGA");
    }
    out.especialidad = esp || null;
  }
  return out;
};

const validarRol = (idRol) => {
  const rol = +idRol;
  if (![ROLES.ADMIN, ROLES.PROFESIONAL, ROLES.PACIENTE].includes(rol)) {
    throw new AppError(400, "Elegí un rol válido: Administrador, Profesional de salud o Paciente.", "ROL_INVALIDO");
  }
  return rol;
};

const validarPatologias = async (ids) => {
  const lista = Array.isArray(ids) ? [...new Set(ids.map((x) => +x).filter(Boolean))] : [];
  if (lista.length === 0) {
    throw new AppError(400, "Elegí al menos una patología para el paciente. Define qué contenido va a ver.", "PATOLOGIAS_REQUERIDAS");
  }
  const existentes = await prisma.patologia.count({ where: { id: { in: lista }, habilitado: 1 } });
  if (existentes !== lista.length) {
    throw new AppError(400, "Alguna de las patologías elegidas ya no está disponible. Actualizá la página y elegí de nuevo.", "PATOLOGIA_INVALIDA");
  }
  return lista;
};

// Sincroniza las patologías activas de un paciente (no borra: deshabilita las quitadas).
const sincronizarPatologias = async (tx, pacienteId, ids) => {
  const actuales = await tx.patologiaPaciente.findMany({ where: { pacienteId } });
  for (const fila of actuales) {
    const debeEstar = ids.includes(fila.patologiaId);
    if (debeEstar && fila.habilitado !== 1) {
      await tx.patologiaPaciente.update({ where: { id: fila.id }, data: { habilitado: 1 } });
    } else if (!debeEstar && fila.habilitado !== 0) {
      await tx.patologiaPaciente.update({ where: { id: fila.id }, data: { habilitado: 0 } });
    }
  }
  const yaTiene = new Set(actuales.map((f) => f.patologiaId));
  for (const patologiaId of ids) {
    if (!yaTiene.has(patologiaId)) {
      await tx.patologiaPaciente.create({ data: { pacienteId, patologiaId } });
    }
  }
};

const EMAIL_TIMEOUT_MS = 10000;

// Intenta enviar la contraseña por email SIN bloquear la operación principal.
// Devuelve { enviado, motivo } y nunca lanza: la cuenta ya existe aunque el correo falle.
const intentarEnviarPassword = async (email, password, accion) => {
  if (!validator.isEmail(email || "")) return { enviado: false, motivo: "EMAIL_INVALIDO" };
  try {
    const r = await Promise.race([
      sendPasswordResetEmail(email, password),
      new Promise((resolve) => setTimeout(() => resolve({ err: new Error(`sin respuesta en ${EMAIL_TIMEOUT_MS / 1000}s`) }), EMAIL_TIMEOUT_MS)),
    ]);
    if (r?.err) {
      console.error(`[email] No se pudo enviar (${accion}) a ${email}:`, r.err?.message || r.err);
      return { enviado: false, motivo: "ENVIO_FALLIDO" };
    }
    return { enviado: true };
  } catch (e) {
    console.error(`[email] No se pudo enviar (${accion}) a ${email}:`, e?.message || e);
    return { enviado: false, motivo: "ENVIO_FALLIDO" };
  }
};

export class UsuarioModel {
  static getAll = async () => {
    const usuarios = await prisma.usuario.findMany({ select: USUARIO_PUBLICO, orderBy: { id: "desc" } });
    return usuarios.map(presentarUsuario);
  };

  static getRolByUser = async (user) => {
    const u = await prisma.usuario.findFirst({ where: { usuario: user }, select: { idRol: true } });
    return u?.idRol;
  };

  static getAllRoles = async () => prisma.rol.findMany({ where: { habilitado: 1 } });

  static getAllRolesToEdit = async (idRol) =>
    prisma.rol.findMany({ where: { habilitado: 1, id: { notIn: [+idRol || 0] } } });

  static getUsuariobyId = async (id) => {
    const u = await prisma.usuario.findUnique({ where: { id: +id }, select: USUARIO_PUBLICO });
    if (!u) throw new AppError(404, "No encontramos esa cuenta. Puede que la hayan eliminado. Actualizá la página.", "NO_ENCONTRADO");
    return presentarUsuario(u);
  };

  static updateUsuario = async (id, body, actor) => {
    id = +id;
    const actual = await prisma.usuario.findUnique({ where: { id }, include: { paciente: true } });
    if (!actual) throw new AppError(404, "No encontramos esa cuenta. Puede que la hayan eliminado. Actualizá la página.", "NO_ENCONTRADO");
    const data = await validarDatosBasicos(body, { id, parcial: true, actual });
    let nuevoRol = actual.idRol;
    if (body.idRol !== undefined && +body.idRol !== actual.idRol) {
      nuevoRol = validarRol(body.idRol);
      if (actor?.id === id) {
        throw new AppError(400, "No podés cambiar tu propio rol. Pedile a otro administrador que lo haga.", "AUTO_ROL");
      }
      data.idRol = nuevoRol;
    }
    // La especialidad solo tiene sentido para profesionales de salud.
    if (nuevoRol !== ROLES.PROFESIONAL && (actual.especialidad || data.especialidad)) data.especialidad = null;
    let idsPatologias = null;
    if (nuevoRol === ROLES.PACIENTE && (body.idsPatologias !== undefined || !actual.paciente)) {
      idsPatologias = await validarPatologias(body.idsPatologias);
    }
    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({ where: { id }, data });
      if (nuevoRol === ROLES.PACIENTE) {
        let paciente = actual.paciente;
        if (!paciente) {
          paciente = await tx.paciente.create({ data: { idUsuario: id, habilitado: 1 } });
        }
        if (idsPatologias) await sincronizarPatologias(tx, paciente.id, idsPatologias);
      }
    });
    return this.getUsuariobyId(id);
  };

  // Cambio de la propia contraseña (requiere la actual, salvo en el cambio obligatorio del primer ingreso).
  static cambiarPasswordPropia = async (id, { passwordActual, newPassword }, scope) => {
    const u = await prisma.usuario.findUnique({ where: { id: +id } });
    if (!u) throw new AppError(404, "No encontramos tu cuenta. Ingresá de nuevo.", "NO_ENCONTRADO");
    if (scope !== "password-change") {
      if (!passwordActual || !(await bcrypt.compare(passwordActual, u.password))) {
        throw new AppError(400, "La contraseña actual no es correcta. Revisala e intentá de nuevo.", "PASSWORD_ACTUAL_INCORRECTA");
      }
    }
    validarPasswordNueva(newPassword);
    if (await bcrypt.compare(newPassword, u.password)) {
      throw new AppError(400, "La contraseña nueva tiene que ser distinta de la anterior.", "PASSWORD_REPETIDA");
    }
    const hash = await bcrypt.hash(newPassword, 10);
    const actualizado = await prisma.usuario.update({
      where: { id: u.id },
      data: { password: hash, blanqueado: 1 },
      select: USUARIO_PUBLICO,
    });
    await prisma.recuperacionPassword.updateMany({ where: { usuarioId: u.id, usadoAt: null }, data: { usadoAt: new Date() } });
    return { usuario: presentarUsuario(actualizado), token: signSessionToken(actualizado) };
  };

  // Restablecer contraseña (solo administradores): genera una temporal y la envía por email.
  static blanquearUsuario = async (id) => {
    const u = await prisma.usuario.findUnique({ where: { id: +id } });
    if (!u) throw new AppError(404, "No encontramos esa cuenta. Actualizá la página.", "NO_ENCONTRADO");
    const temporal = generarPasswordTemporal();
    const hash = await bcrypt.hash(temporal, 10);
    await prisma.usuario.update({ where: { id: u.id }, data: { password: hash, blanqueado: 0 } });
    // Si había enlaces de «¿Olvidaste tu contraseña?» pendientes, dejan de servir.
    await prisma.recuperacionPassword.updateMany({ where: { usuarioId: u.id, usadoAt: null }, data: { usadoAt: new Date() } });
    const envio = await intentarEnviarPassword(u.email, temporal, "restablecer contraseña");
    return {
      ok: true,
      email: enmascararEmail(u.email),
      emailEnviado: envio.enviado,
      motivoEmail: envio.motivo || null,
      // Solo si el correo no salió: el administrador la ve UNA vez para entregarla.
      passwordTemporal: envio.enviado ? undefined : temporal,
    };
  };

  static addUsuario = async (body) => {
    const data = await validarDatosBasicos(body);
    const idRol = validarRol(body.idRol);
    const idsPatologias = idRol === ROLES.PACIENTE ? await validarPatologias(body.idsPatologias) : [];
    if (idRol !== ROLES.PROFESIONAL) delete data.especialidad;
    let password = typeof body.password === "string" && body.password.length > 0 ? body.password : null;
    const passwordManual = Boolean(password);
    if (password) validarPasswordNueva(password);
    else password = generarPasswordTemporal();
    const hash = await bcrypt.hash(password, 10);

    const creado = await prisma.$transaction(async (tx) => {
      const nuevo = await tx.usuario.create({
        data: { ...data, password: hash, blanqueado: 0, habilitado: 1, rol: { connect: { id: idRol } } },
      });
      if (idRol === ROLES.PACIENTE) {
        await tx.paciente.create({
          data: {
            idUsuario: nuevo.id,
            habilitado: 1,
            patologia: { create: idsPatologias.map((patologiaId) => ({ patologiaId })) },
          },
        });
      }
      return nuevo;
    });
    // La cuenta ya está creada. El email es un intento aparte (máx. 10 s) y su falla no la deshace.
    const envio = await intentarEnviarPassword(creado.email, password, "alta de cuenta");
    const usuario = await this.getUsuariobyId(creado.id);
    return {
      newUsuario: usuario,
      emailEnmascarado: enmascararEmail(usuario.email),
      emailEnviado: envio.enviado,
      motivoEmail: envio.motivo || null,
      passwordManual,
      // Solo si el correo no salió y la contraseña la generó el sistema (el admin no la conoce).
      passwordTemporal: !envio.enviado && !passwordManual ? password : undefined,
    };
  };

  static login = async (usuario, password) => {
    const credencialesInvalidas = new AppError(401, "Usuario o contraseña incorrectos. Revisá los datos e intentá de nuevo.", "CREDENCIALES_INVALIDAS");
    if (!usuario || !password) {
      throw new AppError(400, "Ingresá tu usuario y tu contraseña.", "DATO_FALTANTE");
    }
    const candidatos = await prisma.usuario.findMany({
      where: { usuario: String(usuario).trim() },
      include: { paciente: { select: { id: true, habilitado: true } } },
      orderBy: { habilitado: "desc" },
    });
    let encontrado = null;
    for (const c of candidatos) {
      if (await bcrypt.compare(String(password), c.password)) {
        encontrado = c;
        break;
      }
    }
    if (!encontrado) throw credencialesInvalidas;
    const pacienteDeshabilitado =
      encontrado.idRol === ROLES.PACIENTE && encontrado.paciente && encontrado.paciente.habilitado !== 1;
    if (encontrado.habilitado !== 1 || pacienteDeshabilitado) {
      throw new AppError(403, "Tu cuenta está deshabilitada. Comunicate con el hospital para volver a habilitarla.", "CUENTA_DESHABILITADA");
    }
    const base = {
      id: encontrado.id,
      usuario: encontrado.usuario,
      nombre: encontrado.nombre,
      apellido: encontrado.apellido,
      dni: encontrado.dni,
      rol: encontrado.idRol,
      blanqueado: encontrado.blanqueado,
    };
    if (encontrado.blanqueado === 0) {
      return { ...base, debeCambiarPassword: true, tokenCambio: signPasswordChangeToken(encontrado) };
    }
    return { ...base, debeCambiarPassword: false, token: signSessionToken(encontrado) };
  };

  static renovarToken = async (id) => {
    const u = await prisma.usuario.findUnique({ where: { id: +id } });
    return { token: signSessionToken(u) };
  };

  static setHabilitado = async (id, habilitado, actor) => {
    id = +id;
    if (actor?.id === id && !habilitado) {
      throw new AppError(400, "No podés deshabilitar tu propia cuenta. Pedile a otro administrador que lo haga.", "AUTO_DESHABILITAR");
    }
    const u = await prisma.usuario.findUnique({ where: { id } });
    if (!u) throw new AppError(404, "No encontramos esa cuenta. Actualizá la página.", "NO_ENCONTRADO");
    if (habilitado && u.habilitado !== 1) await verificarConflictosAlHabilitar(u);
    await prisma.usuario.update({ where: { id }, data: { habilitado: habilitado ? 1 : 0 } });
    return this.getUsuariobyId(id);
  };

  static getPatologiaToUsuarioEdit = async (id) => {
    const todas = await prisma.patologia.findMany({ where: { habilitado: 1 } });
    const paciente = await prisma.paciente.findUnique({
      where: { idUsuario: +id },
      include: { patologia: { where: { habilitado: 1 }, include: { patologia: true } } },
    });
    const patologiasAsociadas = (paciente?.patologia || []).map((p) => p.patologia).filter((p) => p?.habilitado === 1);
    const ids = new Set(patologiasAsociadas.map((p) => p.id));
    return { patologiasAsociadas, patologiasNoAsociadas: todas.filter((p) => !ids.has(p.id)) };
  };

  static getProfesionales = async () =>
    prisma.usuario.findMany({
      where: { idRol: ROLES.PROFESIONAL, habilitado: 1 },
      // Esta lista la ven también los pacientes: sin email ni otros datos personales.
      select: { id: true, nombre: true, apellido: true, especialidad: true },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    });
}
