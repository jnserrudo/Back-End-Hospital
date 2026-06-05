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
import { autoevaluacionRouter } from "./autoevaluacion.js";

/* ENTIDADES:

usuarios
recetas
informacion
patologias
pacientes
infografias
calendario
feedback
faq */
export const router = express.Router();

router.use('/usuarios',usuarioRouter)
router.use('/pacientes',pacienteRouter)
router.use('/patologias',patologiaRouter)
router.use('/recetas',recetaRouter)
router.use('/informacion',informacionRouter)
router.use('/ejercicios',ejercicioRouter)
router.use('/categorias',categoriaRouter)
router.use('/infografias',infografiaRouter)
router.use('/calendario',calendarioRouter)
router.use('/feedback',feedbackRouter)
router.use('/faq',faqRouter)
router.use('/autoevaluaciones', autoevaluacionRouter)


