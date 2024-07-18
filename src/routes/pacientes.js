import express from "express";
import { PacienteController } from "../controllers/paciente.js";


export const pacienteRouter=express.Router()

pacienteRouter.get('/', PacienteController.getAll)

pacienteRouter.get('/:dni', PacienteController.getPacientebyDni)

pacienteRouter.put('/:dni', PacienteController.updatePaciente)

pacienteRouter.put('/inhabilitar/:id', PacienteController.disable)


pacienteRouter.post('/',PacienteController.addPaciente)

