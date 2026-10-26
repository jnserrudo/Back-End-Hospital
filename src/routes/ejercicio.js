import express from "express";
import { EjercicioController } from "../controllers/ejercicio.js";



import { crearUpload } from "../middlewares/upload.js";

// Tipos y tamaños permitidos (los errores vuelven con un mensaje claro).
const upload = crearUpload({ tipos: ["imagen", "video"], maxMB: { imagen: 5, video: 200 } });




export const ejercicioRouter=express.Router()

ejercicioRouter.get('/', EjercicioController.getAll)

ejercicioRouter.post('/filtro', EjercicioController.getEjercicioFiltro)

ejercicioRouter.get('/:id', EjercicioController.getEjerciciobyId)

ejercicioRouter.put('/:id', EjercicioController.updateEjercicio)

ejercicioRouter.put('/inhabilitar/:id', EjercicioController.disable)

ejercicioRouter.get('/patologia/add', EjercicioController.getPatologiaToEjercicioAdd)

ejercicioRouter.get('/patologia/edit/:id', EjercicioController.getPatologiaToEjercicioEdit)

ejercicioRouter.get('/categoria/add', EjercicioController.getCategoriaToEjercicioAdd)

ejercicioRouter.get('/categoria/edit/:id', EjercicioController.getCategoriaToEjercicioEdit)




ejercicioRouter.post('/',EjercicioController.addEjercicio)


ejercicioRouter.post('/upload/files', upload, EjercicioController.uploadVideo);

