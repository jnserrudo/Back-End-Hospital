import express from "express";
import { RecetaController } from "../controllers/receta.js";


export const recetaRouter=express.Router()

recetaRouter.get('/', RecetaController.getAll)

recetaRouter.get('/:id', RecetaController.getRecetabyId)

recetaRouter.put('/:id', RecetaController.updateReceta)

recetaRouter.post('/',RecetaController.addReceta)

