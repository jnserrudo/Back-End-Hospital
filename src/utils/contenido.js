import { PrismaClient } from "@prisma/client";
import { AppError } from "./http.js";
import { ROLES } from "../middlewares/auth.js";

const prisma = new PrismaClient();

// Patologías activas del paciente logueado, o null si no es paciente
// (administradores y profesionales ven todo el contenido).
export const patologiasDelPaciente = async (user) => {
  if (!user || user.rol !== ROLES.PACIENTE) return null;
  if (!user.pacienteId) return [];
  const rows = await prisma.patologiaPaciente.findMany({
    where: { pacienteId: user.pacienteId, habilitado: 1, patologia: { habilitado: 1 } },
    select: { patologiaId: true },
  });
  return rows.map((r) => r.patologiaId);
};

/**
 * Filtra contenido (recetas, ejercicios, información) para un paciente:
 * ve el contenido general (sin patologías asociadas) y el de sus patologías.
 */
export const personalizar = async (req, items) => {
  if (!Array.isArray(items)) return items;
  const ids = await patologiasDelPaciente(req.user);
  if (ids === null) return items;
  return items.filter((item) => {
    const asociadas = (item?.patologia || []).filter((p) => p?.habilitado !== 0);
    if (asociadas.length === 0) return true;
    return asociadas.some((p) => ids.includes(p.patologiaId ?? p.patologia?.id));
  });
};

// --- YouTube: solo aceptamos un video de YouTube (enlace o iframe) y lo
// normalizamos a un iframe limpio generado por nosotros (evita XSS).
const YT_ID = /^[A-Za-z0-9_-]{6,20}$/;

export const extraerIdYoutube = (valor = "") => {
  if (!valor || typeof valor !== "string") return null;
  let url = valor.trim();
  const src = url.match(/src\s*=\s*["']([^"']+)["']/i);
  if (url.startsWith("<")) {
    if (!src) return null;
    url = src[1];
  }
  try {
    const u = new URL(url.startsWith("//") ? `https:${url}` : url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id = null;
    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (["youtube.com", "youtube-nocookie.com"].includes(host)) {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else {
        const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/);
        if (m) id = m[2];
      }
    }
    return id && YT_ID.test(id) ? id : null;
  } catch {
    return null;
  }
};

// Si urlVideo viene como HTML, solo se acepta un iframe de YouTube y se reescribe.
export const sanitizarUrlVideo = (body) => {
  if (!body || typeof body.urlVideo !== "string") return body;
  const valor = body.urlVideo.trim();
  if (valor.includes("<") || valor.includes(">")) {
    const id = extraerIdYoutube(valor);
    if (!id) {
      throw new AppError(
        400,
        "El video tiene un formato no permitido. Pegá el enlace de YouTube (por ejemplo https://www.youtube.com/watch?v=...) o subí un archivo de video.",
        "VIDEO_INVALIDO"
      );
    }
    body.urlVideo = `<iframe src="https://www.youtube.com/embed/${id}" title="Video de YouTube" allowfullscreen></iframe>`;
  }
  return body;
};
