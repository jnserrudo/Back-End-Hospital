import { PrismaClient } from "@prisma/client";
import { AppError } from "../utils/http.js";
import { UsuarioModel, verificarConflictosAlHabilitar } from "./usuario.js";

const prisma = new PrismaClient();

const USUARIO_SELECT = {
  id: true, usuario: true, dni: true, nombre: true, apellido: true, email: true, habilitado: true, detalle: true, idRol: true,
};

const PACIENTE_INCLUDE = {
  usuario: { select: USUARIO_SELECT },
  patologia: {
    where: { habilitado: 1 },
    select: { patologia: { select: { id: true, nombre: true, habilitado: true } } },
  },
  habilitaciones: {
    orderBy: { fechaHora: "desc" },
    select: {
      id: true, motivo: true, tipo: true, fechaHora: true,
      usuario: { select: { nombre: true, apellido: true, usuario: true } },
    },
  },
};

const presentar = (p) => {
  if (!p) return p;
  const activo = p.habilitado === 1 && p.usuario?.habilitado === 1;
  return {
    ...p,
    activo,
    patologias: (p.patologia || []).map((x) => x.patologia).filter(Boolean),
    ultimaHabilitacion: p.habilitaciones?.[0] || null,
  };
};

const noEncontrado = () =>
  new AppError(404, "No encontramos ese paciente. Puede que lo hayan eliminado. Actualizá la página.", "NO_ENCONTRADO");

const validarMotivo = (motivo, accion) => {
  const m = typeof motivo === "string" ? motivo.trim() : "";
  if (m.length < 5) {
    throw new AppError(400, `Escribí el motivo para ${accion} al paciente (al menos 5 caracteres). Queda guardado en su historial.`, "MOTIVO_REQUERIDO");
  }
  return m;
};

export class PacienteModel {
  // Solo pacientes con cuenta de usuario (los registros huérfanos no se pueden gestionar).
  static getAll = async () => {
    const pacientes = await prisma.paciente.findMany({
      where: { idUsuario: { not: null } },
      include: { ...PACIENTE_INCLUDE, habilitaciones: { ...PACIENTE_INCLUDE.habilitaciones, take: 1 } },
      orderBy: { id: "desc" },
    });
    return pacientes.map(presentar);
  };

  static getPacientebyId = async (id) => {
    const p = await prisma.paciente.findUnique({ where: { id: +id }, include: PACIENTE_INCLUDE });
    if (!p) throw noEncontrado();
    return presentar(p);
  };

  static getPacienteByUsuario = async (idUsuario) => {
    const p = await prisma.paciente.findUnique({ where: { idUsuario: +idUsuario }, include: PACIENTE_INCLUDE });
    if (!p) throw noEncontrado();
    return presentar(p);
  };

  static cambiarHabilitacion = async (pacienteId, actorId, motivo, habilitar) => {
    const accion = habilitar ? "habilitar" : "deshabilitar";
    const m = validarMotivo(motivo, accion);
    const p = await prisma.paciente.findUnique({ where: { id: +pacienteId }, include: { usuario: true } });
    if (!p) throw noEncontrado();
    const estaActivo = p.habilitado === 1 && (!p.usuario || p.usuario.habilitado === 1);
    if (habilitar && estaActivo) {
      throw new AppError(409, "El paciente ya está habilitado. Actualizá la página para ver su estado actual.", "SIN_CAMBIOS");
    }
    if (!habilitar && !estaActivo) {
      throw new AppError(409, "El paciente ya está deshabilitado. Actualizá la página para ver su estado actual.", "SIN_CAMBIOS");
    }
    if (habilitar && p.usuario && p.usuario.habilitado !== 1) await verificarConflictosAlHabilitar(p.usuario);
    await prisma.$transaction(async (tx) => {
      await tx.paciente.update({ where: { id: p.id }, data: { habilitado: habilitar ? 1 : 0 } });
      // Al habilitar también reactivamos la cuenta si estaba deshabilitada desde Usuarios.
      if (habilitar && p.usuario && p.usuario.habilitado !== 1) {
        await tx.usuario.update({ where: { id: p.usuario.id }, data: { habilitado: 1 } });
      }
      await tx.habilitacionPaciente.create({
        data: { motivo: m, tipo: habilitar ? "habilitacion" : "deshabilitacion", usuarioId: +actorId, pacienteId: p.id },
      });
    });
    return this.getPacientebyId(p.id);
  };

  // Los datos del paciente se editan a través de su cuenta de usuario (rol fijo Paciente).
  static updatePaciente = async (id, body, actor) => {
    const p = await prisma.paciente.findUnique({ where: { id: +id } });
    if (!p || !p.idUsuario) throw noEncontrado();
    const { idRol, ...resto } = body || {};
    await UsuarioModel.updateUsuario(p.idUsuario, resto, actor);
    return this.getPacientebyId(p.id);
  };

  static addPaciente = async (body) => {
    const r = await UsuarioModel.addUsuario({ ...(body || {}), idRol: 3 });
    const paciente = await this.getPacienteByUsuario(r.newUsuario.id);
    return { ...r, paciente };
  };
}
