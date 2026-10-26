import { PrismaClient } from "@prisma/client";
import { sendAutoevaluacionEmail, sendDevolucionEmail } from "../../procesoEmail.js";
import validator from "validator";
import { AppError } from "../utils/http.js";

const prisma = new PrismaClient();

// Preguntas que acepta cada tipo de autoevaluación (lo demás se descarta).
const OPCIONES = {
  FrecuenciaSemanal: ["0 días", "1-2 días", "3-4 días", "5 o más días"],
  DuracionPromedio: ["Menos de 30 minutos", "30 a 60 minutos", "Más de 60 minutos"],
  TipoActividades: ["Aeróbico (Cardio)", "Fuerza / Musculación", "Flexibilidad / Estiramientos", "Deportes de equipo"],
  BarrerasEjercicio: ["Falta de tiempo", "Dolor o limitaciones físicas", "Fatiga / Cansancio", "Falta de motivación"],
  ObjetivosSalud: ["Mejorar salud general", "Controlar peso", "Ganar fuerza / Masa muscular", "Controlar patologías crónicas"],
  PainPresent: ["Sí", "No"],
  AlarmSymptoms: ["Dolor / Opresión de pecho", "Mareo / Inestabilidad severa", "Dificultad extrema para respirar", "Palpitaciones aceleradas"],
  ExecutionQuality: ["Totalmente correcta", "Parcialmente correcta", "No pude realizar la técnica"],
};

const error = (msg, code = "DATO_INVALIDO") => new AppError(400, msg, code);

const opcion = (campo, valor, requerido, etiqueta) => {
  if (valor === undefined || valor === null || valor === "") {
    if (requerido) throw error(`Respondé la pregunta «${etiqueta}».`, "DATO_FALTANTE");
    return undefined;
  }
  if (!OPCIONES[campo].includes(valor)) throw error(`La respuesta a «${etiqueta}» no es válida. Volvé a elegirla.`);
  return valor;
};

const lista = (campo, valor) => {
  if (valor === undefined || valor === null) return [];
  if (!Array.isArray(valor)) throw error("Una de las respuestas tiene un formato incorrecto. Volvé a completar el formulario.");
  return [...new Set(valor)].filter((v) => OPCIONES[campo].includes(v));
};

const numero = (valor, min, max, etiqueta, requerido = false) => {
  if (valor === undefined || valor === null || valor === "") {
    if (requerido) throw error(`Respondé la pregunta «${etiqueta}».`, "DATO_FALTANTE");
    return undefined;
  }
  const n = Number(valor);
  if (!Number.isFinite(n) || n < min || n > max) throw error(`«${etiqueta}» tiene que ser un número entre ${min} y ${max}.`);
  return Math.round(n);
};

const texto = (valor, max = 300) => (valor ? String(valor).trim().slice(0, max) : undefined);

/** Valida y limpia las respuestas según el tipo. Devuelve solo los campos conocidos. */
export const limpiarRespuestas = (tipo, r) => {
  if (!r || typeof r !== "object" || Array.isArray(r)) {
    throw error("Respondé las preguntas antes de enviar la autoevaluación.", "DATO_FALTANTE");
  }
  const out = {};
  if (tipo === "general") {
    out.FrecuenciaSemanal = opcion("FrecuenciaSemanal", r.FrecuenciaSemanal, true, "¿Cuántos días por semana hacés actividad física?");
    out.DuracionPromedio = opcion("DuracionPromedio", r.DuracionPromedio, true, "¿Cuánto duran tus sesiones de ejercicio, en promedio?");
    out.TipoActividades = lista("TipoActividades", r.TipoActividades);
    out.AptitudFisica = numero(r.AptitudFisica, 1, 5, "¿Cómo sentís tu estado físico en general?");
    out.BarrerasEjercicio = lista("BarrerasEjercicio", r.BarrerasEjercicio);
    out.ObjetivosSalud = lista("ObjetivosSalud", r.ObjetivosSalud);
  } else {
    out.BorgScale = numero(r.BorgScale, 1, 10, "¿Cuánto esfuerzo te costó?", true);
    out.PainPresent = opcion("PainPresent", r.PainPresent, true, "¿Tuviste dolor durante o después del ejercicio?");
    if (out.PainPresent === "Sí") out.PainEVA = numero(r.PainEVA, 0, 10, "¿Qué tan fuerte fue el dolor?", true);
    out.AlarmSymptoms = lista("AlarmSymptoms", r.AlarmSymptoms);
    out.ExecutionQuality = opcion("ExecutionQuality", r.ExecutionQuality, true, "¿Cómo te salió la técnica del ejercicio?");
  }
  out.Observaciones = texto(r.Observaciones);
  Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
  return out;
};

export const esAlerta = (r = {}) =>
  (r.PainPresent === "Sí" && Number(r.PainEVA) >= 7) || (Array.isArray(r.AlarmSymptoms) && r.AlarmSymptoms.length > 0);

const INCLUDE_LISTA = {
  paciente: {
    select: {
      id: true,
      usuario: { select: { id: true, nombre: true, apellido: true, dni: true, email: true } },
      patologia: { where: { habilitado: 1 }, select: { patologia: { select: { id: true, nombre: true } } } },
    },
  },
  profesional: { select: { id: true, nombre: true, apellido: true, especialidad: true } },
  ejercicio: { select: { id: true, nombre: true } },
};

// Agrega datos útiles para la pantalla: respuestas ya parseadas, alerta y patologías.
const presentar = (a) => {
  let respuestas = {};
  try {
    respuestas = typeof a.respuestas === "string" ? JSON.parse(a.respuestas) : a.respuestas || {};
  } catch {
    respuestas = {};
  }
  // El email no viaja a la pantalla: solo avisamos si el paciente tiene uno válido.
  let paciente = a.paciente;
  if (paciente?.usuario) {
    const { email, ...usuario } = paciente.usuario;
    paciente = { ...paciente, usuario: { ...usuario, tieneEmail: validator.isEmail(email || "") } };
  }
  return {
    ...a,
    paciente,
    respuestas,
    alerta: esAlerta(respuestas),
    patologias: (a.paciente?.patologia || []).map((p) => p.patologia).filter(Boolean),
  };
};

// Fecha AAAA-MM-DD en horario de Argentina (UTC-3).
const fechaAR = (s, finDelDia = false) => {
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s))) throw error("La fecha del filtro no es válida. Elegila de nuevo en el calendario.");
  return new Date(`${s}T${finDelDia ? "23:59:59.999" : "00:00:00.000"}-03:00`);
};

export class AutoevaluacionModel {
  static create = async ({ pacienteId, profesionalId, ejercicioId, tipo, respuestas }) => {
    if (!["general", "ejercicio"].includes(tipo)) {
      throw error("Elegí si es una autoevaluación general o de un ejercicio.");
    }
    if (JSON.stringify(respuestas || {}).length > 10000) {
      throw error("Las respuestas son demasiado largas. Acortá las observaciones e intentá de nuevo.");
    }
    const limpias = limpiarRespuestas(tipo, respuestas);

    let ejercicio = null;
    if (tipo === "ejercicio") {
      if (!ejercicioId) throw error("Elegí el ejercicio que querés evaluar.", "DATO_FALTANTE");
      ejercicio = await prisma.ejercicio.findFirst({ where: { id: +ejercicioId, habilitado: 1 }, select: { id: true, nombre: true } });
      if (!ejercicio) throw error("Ese ejercicio ya no está disponible. Actualizá la página y elegí otro.", "NO_ENCONTRADO");
    }

    let profesional = null;
    if (profesionalId) {
      profesional = await prisma.usuario.findFirst({
        where: { id: +profesionalId, idRol: 2, habilitado: 1 },
        select: { id: true, nombre: true, apellido: true, email: true },
      });
      if (!profesional) {
        throw error("El profesional que elegiste ya no está disponible. Elegí otro o enviala al equipo sin elegir a nadie.", "NO_ENCONTRADO");
      }
    }

    const creada = await prisma.autoevaluacion.create({
      data: {
        pacienteId: +pacienteId,
        profesionalId: profesional ? profesional.id : null,
        ejercicioId: ejercicio ? ejercicio.id : null,
        tipo,
        respuestas: JSON.stringify(limpias),
      },
      include: INCLUDE_LISTA,
    });

    // Aviso por email en segundo plano: la autoevaluación ya quedó guardada.
    if (profesional?.email) {
      const u = creada.paciente?.usuario;
      Promise.resolve(
        sendAutoevaluacionEmail(profesional.email, `${u?.nombre || ""} ${u?.apellido || ""}`.trim(), tipo, limpias, ejercicio?.nombre || null)
      )
        .then((r) => r?.err && console.error("[email] No se pudo avisar al profesional:", r.err?.message || r.err))
        .catch((e) => console.error("[email] No se pudo avisar al profesional:", e?.message || e));
    }
    return presentar(creada);
  };

  // Historial del propio paciente.
  static getDelPaciente = async (pacienteId) => {
    const lista = await prisma.autoevaluacion.findMany({
      where: { pacienteId: +pacienteId },
      orderBy: { createdAt: "desc" },
      include: INCLUDE_LISTA,
    });
    return lista.map(presentar);
  };

  static getAll = async ({ pacienteId, profesionalId, tipo, desde, hasta, patologiaId, revisada } = {}) => {
    const where = {};
    if (pacienteId) where.pacienteId = +pacienteId;
    if (profesionalId === "sin") where.profesionalId = null;
    else if (profesionalId) where.profesionalId = +profesionalId;
    if (tipo) where.tipo = tipo;
    if (revisada === "0" || revisada === "1") where.revisada = +revisada;
    const d = fechaAR(desde);
    const h = fechaAR(hasta, true);
    if (d || h) where.createdAt = { ...(d ? { gte: d } : {}), ...(h ? { lte: h } : {}) };
    if (patologiaId) where.paciente = { patologia: { some: { patologiaId: +patologiaId, habilitado: 1 } } };
    const lista = await prisma.autoevaluacion.findMany({ where, orderBy: { createdAt: "desc" }, include: INCLUDE_LISTA });
    return lista.map(presentar);
  };

  static getById = async (id) => {
    const a = await prisma.autoevaluacion.findUnique({ where: { id: +id }, include: INCLUDE_LISTA });
    if (!a) throw new AppError(404, "No encontramos esa autoevaluación. Actualizá la página.", "NO_ENCONTRADO");
    return presentar(a);
  };

  // El equipo deja una devolución (opcional) y la marca como revisada.
  // Si hay devolución nueva y el paciente tiene email, se le avisa (sin frenar la respuesta más de 8 s).
  static revisar = async (id, { devolucion }, actor) => {
    const actual = await prisma.autoevaluacion.findUnique({ where: { id: +id }, select: { id: true, devolucion: true } });
    if (!actual) throw new AppError(404, "No encontramos esa autoevaluación. Actualizá la página.", "NO_ENCONTRADO");
    const txt = devolucion ? String(devolucion).trim() : "";
    if (txt.length > 1000) throw error("La devolución puede tener hasta 1000 caracteres.");
    const nombreActor = `${actor.nombre || ""} ${actor.apellido || ""}`.trim() || actor.usuario;
    const a = await prisma.autoevaluacion.update({
      where: { id: +id },
      data: {
        revisada: 1,
        devolucion: txt || null,
        revisadaAt: new Date(),
        revisadaPorId: actor.id,
        revisadaPorNombre: nombreActor,
      },
      include: INCLUDE_LISTA,
    });

    // Resultado del aviso por email: "enviado" | "sin_email" | "sin_devolucion" | "sin_cambios" | "fallo"
    let email = "sin_devolucion";
    const destino = a.paciente?.usuario?.email;
    if (txt && txt === (actual.devolucion || "")) email = "sin_cambios";
    else if (txt && !validator.isEmail(destino || "")) email = "sin_email";
    else if (txt) {
      try {
        const r = await Promise.race([
          sendDevolucionEmail(destino, {
            pacienteNombre: a.paciente.usuario.nombre,
            profesionalNombre: nombreActor,
            devolucion: txt,
            tipoTexto: a.tipo === "ejercicio" ? `autoevaluación del ejercicio «${a.ejercicio?.nombre || ""}»` : "autoevaluación general",
            fechaTexto: a.createdAt.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }),
          }),
          new Promise((resolve) => setTimeout(() => resolve({ err: new Error("sin respuesta en 8 s") }), 8000)),
        ]);
        email = r?.err ? "fallo" : "enviado";
        if (r?.err) console.error("[email] No se pudo avisar la devolución:", r.err?.message || r.err);
      } catch (e) {
        email = "fallo";
        console.error("[email] No se pudo avisar la devolución:", e?.message || e);
      }
    }
    return { ...presentar(a), email };
  };
}
