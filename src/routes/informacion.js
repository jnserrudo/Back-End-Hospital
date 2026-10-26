import express from "express";
import { InformacionController } from "../controllers/informacion.js";


import { crearUpload } from "../middlewares/upload.js";

// Tipos y tamaños permitidos (los errores vuelven con un mensaje claro).
const upload = crearUpload({ tipos: ["imagen", "video"], maxMB: { imagen: 5, video: 200 } });



export const informacionRouter=express.Router()

informacionRouter.get('/', InformacionController.getAll)

informacionRouter.post('/filtro', InformacionController.getInfoFiltro)

informacionRouter.get('/:id', InformacionController.getInformacionbyId)

informacionRouter.put('/:id', InformacionController.updateInformacion)

informacionRouter.put('/inhabilitar/:id', InformacionController.disable)

informacionRouter.get('/patologia/add', InformacionController.getPatologiaToInformacionAdd)

informacionRouter.get('/patologia/edit/:id', InformacionController.getPatologiaToInformacionEdit)

informacionRouter.get('/categoria/add', InformacionController.getCategoriaToInformacionAdd)

informacionRouter.get('/categoria/edit/:id', InformacionController.getCategoriaToInformacionEdit)


informacionRouter.post('/',InformacionController.addInformacion)

informacionRouter.post('/upload/files', upload, InformacionController.uploadVideo);
