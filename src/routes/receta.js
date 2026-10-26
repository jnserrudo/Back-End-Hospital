import express from "express";
import { RecetaController } from "../controllers/receta.js";


import { crearUpload } from "../middlewares/upload.js";

// Tipos y tamaños permitidos (los errores vuelven con un mensaje claro).
const upload = crearUpload({ tipos: ["imagen"], maxMB: { imagen: 5 } });



export const recetaRouter=express.Router()

recetaRouter.get('/', RecetaController.getAll)

recetaRouter.post('/filtro', RecetaController.getRecetaFiltro)

recetaRouter.get('/:id', RecetaController.getRecetabyId)

recetaRouter.post('/upload/files',upload, RecetaController.uploadFiles)


recetaRouter.get('/patologia/add', RecetaController.getPatologiaToRecetaAdd)

recetaRouter.get('/patologia/edit/:id', RecetaController.getPatologiaToRecetaEdit)

recetaRouter.get('/categoria/add', RecetaController.getCategoriaToRecetaAdd)

recetaRouter.get('/categoria/edit/:id', RecetaController.getCategoriaToRecetaEdit)

recetaRouter.get('/patologia/:idPatologia', RecetaController.getRecetabyPatologia)

recetaRouter.get('/paciente/:ndocu', RecetaController.getRecetabyPaciente)

recetaRouter.put('/:id', RecetaController.updateReceta)

recetaRouter.put('/inhabilitar/:id', RecetaController.disable)


recetaRouter.post('/',RecetaController.addReceta)

