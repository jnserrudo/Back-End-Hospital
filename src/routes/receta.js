import express from "express";
import { RecetaController } from "../controllers/receta.js";


export const recetaRouter=express.Router()

recetaRouter.get('/', RecetaController.getAll)

recetaRouter.get('/:id', RecetaController.getRecetabyId)

recetaRouter.get('/patologia/add', RecetaController.getPatologiaToRecetaAdd)

recetaRouter.get('/patologia/edit/:id', RecetaController.getPatologiaToRecetaEdit)

recetaRouter.get('/patologia/:idPatologia', RecetaController.getRecetabyPatologia)

recetaRouter.get('/paciente/:ndocu', RecetaController.getRecetabyPaciente)

recetaRouter.put('/:id', RecetaController.updateReceta)

recetaRouter.post('/',RecetaController.addReceta)

