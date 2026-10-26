import express from "express";
import { AutoevaluacionController } from "../controllers/autoevaluacion.js";
import { requireRole, ROLES, STAFF } from "../middlewares/auth.js";

// requireAuth se aplica en routes/main.js
export const autoevaluacionRouter = express.Router();
const paciente = requireRole(ROLES.PACIENTE);
const staff = requireRole(...STAFF);

autoevaluacionRouter.post("/", paciente, AutoevaluacionController.create);
autoevaluacionRouter.get("/mias", paciente, AutoevaluacionController.getMias);
autoevaluacionRouter.get("/", staff, AutoevaluacionController.getAll);
autoevaluacionRouter.get("/:id", AutoevaluacionController.getById); // personal o el propio paciente
autoevaluacionRouter.put("/:id/revision", staff, AutoevaluacionController.revisar);
