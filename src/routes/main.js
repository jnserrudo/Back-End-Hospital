import express from "express";
import { pacienteRouter } from "./pacientes.js";
import { usuarioRouter } from "./usuario.js";
import { patologiaRouter } from "./patologia.js";
import { recetaRouter } from "./receta.js";
import { informacionRouter } from "./informacion.js";
import { ejercicioRouter } from "./ejercicio.js";
import { categoriaRouter } from "./categorias.js";
import { infografiaRouter } from "./infografia.js";
import { calendarioRouter } from "./calendario.js";
import { feedbackRouter, faqRouter } from "./feedback.js";
import { estadoRouter } from "./estado.js";
import { autoevaluacionRouter } from "./autoevaluacion.js";
import { requireAuth, requireRole, writeRoles, ROLES, STAFF } from "../middlewares/auth.js";
import { validarUrlsMedia } from "../middlewares/seguridad.js";

/*
 * Permisos (Etapa 1):
 * - Público: solo POST /usuarios/jwtToken (login). El cambio obligatorio de contraseña
 *   usa un token de alcance limitado (ver routes/usuario.js).
 * - Cualquier usuario con sesión: leer contenido (recetas, información, ejercicios,
 *   infografías, calendario, FAQ, patologías, categorías) y enviar sugerencias.
 *   Los pacientes ven el contenido filtrado por sus patologías.
 * - Administrador y profesional de salud: cargar y editar contenido, ver pacientes y autoevaluaciones.
 * - Solo administrador: usuarios, patologías, categorías, alta/edición y habilitación de pacientes,
 *   lectura de sugerencias.
 * - Solo paciente: enviar autoevaluaciones.
 */
export const router = express.Router();
const auth = requireAuth();
const admin = [ROLES.ADMIN];

router.use("/usuarios", usuarioRouter); // maneja su propia autenticación (login público)

router.use("/pacientes", auth, pacienteRouter);
router.use("/patologias", auth, writeRoles(admin), patologiaRouter);
router.use("/categorias", auth, writeRoles(admin), categoriaRouter);
router.use("/recetas", auth, writeRoles(STAFF, { readOnlyPosts: ["/filtro"] }), validarUrlsMedia, recetaRouter);
router.use("/informacion", auth, writeRoles(STAFF, { readOnlyPosts: ["/filtro"] }), validarUrlsMedia, informacionRouter);
router.use("/ejercicios", auth, writeRoles(STAFF, { readOnlyPosts: ["/filtro"] }), validarUrlsMedia, ejercicioRouter);
router.use("/infografias", auth, writeRoles(STAFF), validarUrlsMedia, infografiaRouter);
router.use("/calendario", auth, writeRoles(STAFF), validarUrlsMedia, calendarioRouter);
router.use("/faq", auth, writeRoles(STAFF), faqRouter);

// Ver y recuperar contenido deshabilitado (permisos por entidad dentro del router)
router.use("/estado", auth, estadoRouter);

// Sugerencias: cualquiera con sesión puede enviar; solo el administrador las lee.
router.use("/feedback", auth, (req, res, next) =>
  req.method === "POST" && req.path === "/" ? next() : requireRole(ROLES.ADMIN)(req, res, next)
, feedbackRouter);

// Autoevaluaciones: las envía y consulta el paciente (las suyas); el personal de salud
// las ve todas y deja la devolución. Los permisos por acción están en el router.
router.use("/autoevaluaciones", auth, autoevaluacionRouter);

// Cualquier otra ruta de la API
router.use((req, res) =>
  res.status(404).json({
    message: "La función que intentaste usar no existe. Actualizá la página; si sigue pasando, avisá al administrador.",
    err: { message: "La función que intentaste usar no existe." },
  })
);
