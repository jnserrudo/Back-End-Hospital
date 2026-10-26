import express from "express";
import { PrismaClient } from "@prisma/client";
import { requireRole, ROLES, STAFF } from "../middlewares/auth.js";
import { AppError, handle, sendError } from "../utils/http.js";

/**
 * Recuperar contenido deshabilitado (borrado lógico).
 *  GET  /api/estado/:entidad/deshabilitados   → lista de elementos deshabilitados
 *  PUT  /api/estado/:entidad/habilitar/:id    → los vuelve a habilitar
 * Los permisos son los mismos que para editar cada entidad.
 */
const prisma = new PrismaClient();

const ENTIDADES = {
  recetas: { modelo: "receta", campo: "nombre", roles: STAFF, articulo: "La receta" },
  ejercicios: { modelo: "ejercicio", campo: "nombre", roles: STAFF, articulo: "El ejercicio" },
  informacion: { modelo: "informacion", campo: "nombre", roles: STAFF, articulo: "La información" },
  infografias: { modelo: "infografiaDieta", campo: "titulo", roles: STAFF, articulo: "La infografía" },
  calendario: { modelo: "eventoCalendario", campo: "titulo", roles: STAFF, articulo: "El evento" },
  faq: { modelo: "fAQ", campo: "pregunta", roles: STAFF, articulo: "La pregunta" },
  patologias: { modelo: "patologia", campo: "nombre", roles: [ROLES.ADMIN], articulo: "La patología" },
  categorias: { modelo: "categoria", campo: "nombre", roles: [ROLES.ADMIN], articulo: "La categoría" },
};

const resolver = (req, res, next) => {
  const cfg = ENTIDADES[req.params.entidad];
  if (!cfg) return sendError(res, new AppError(404, "Esa sección no existe. Actualizá la página.", "NO_ENCONTRADO"));
  req.entidad = cfg;
  return requireRole(...cfg.roles)(req, res, next);
};

export const estadoRouter = express.Router();

estadoRouter.get(
  "/:entidad/deshabilitados",
  resolver,
  handle("No pudimos cargar los elementos deshabilitados", async (req, res) => {
    const { modelo, campo } = req.entidad;
    const items = await prisma[modelo].findMany({ where: { habilitado: 0 }, orderBy: { id: "desc" } });
    res.json(items.map((i) => ({ ...i, etiqueta: i[campo] })));
  })
);

estadoRouter.put(
  "/:entidad/habilitar/:id",
  resolver,
  handle("No pudimos volver a habilitar el elemento", async (req, res) => {
    const { modelo, campo } = req.entidad;
    const id = +req.params.id;
    const actual = await prisma[modelo].findUnique({ where: { id } });
    if (!actual) throw new AppError(404, "No encontramos ese elemento. Actualizá la página.", "NO_ENCONTRADO");
    if (actual.habilitado === 1) throw new AppError(409, "Ese elemento ya está habilitado. Actualizá la página para ver su estado.", "SIN_CAMBIOS");
    const item = await prisma[modelo].update({ where: { id }, data: { habilitado: 1 } });
    res.json({ ...item, etiqueta: item[campo] });
  })
);
