import express from "express";
import { EjercicioController } from "../controllers/ejercicio.js";


export const ejercicioRouter=express.Router()

ejercicioRouter.get('/', EjercicioController.getAll)

ejercicioRouter.get('/:id', EjercicioController.getEjerciciobyId)

ejercicioRouter.put('/:id', EjercicioController.updateEjercicio)

ejercicioRouter.post('/',EjercicioController.addEjercicio)

