import express from "express";
import { PacienteController } from "../controllers/paciente.js";
import { requireRole, ROLES, STAFF } from "../middlewares/auth.js";

// requireAuth se aplica en routes/main.js
export const pacienteRouter = express.Router();
const admin = requireRole(ROLES.ADMIN);
const staff = requireRole(...STAFF);

pacienteRouter.get("/", staff, PacienteController.getAll);
pacienteRouter.get("/informacion/patologias/:idUsuario", PacienteController.getInformacionxPaciente);
pacienteRouter.get("/ejercicios/patologias/:idUsuario", PacienteController.getEjerciciosxPaciente);
pacienteRouter.get("/:id", PacienteController.getPacientebyId); // personal, o el propio paciente
pacienteRouter.put("/deshabilitar", admin, PacienteController.DeshabilitarPaciente);
pacienteRouter.put("/habilitar", admin, PacienteController.HabilitarPaciente);
pacienteRouter.put("/inhabilitar/:id", admin, PacienteController.disable);
pacienteRouter.put("/:id", admin, PacienteController.updatePaciente);
pacienteRouter.post("/", admin, PacienteController.addPaciente);
