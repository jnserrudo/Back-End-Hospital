import express from "express";
import { RecetaController } from "../controllers/receta.js";


import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const filename = fileURLToPath(import.meta.url);
const dirnamex = dirname(filename);
// Configuración de Multer para guardar archivos en la carpeta 'uploads'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(dirnamex, '../uploads'));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage: storage });



export const recetaRouter=express.Router()

recetaRouter.get('/', RecetaController.getAll)

recetaRouter.get('/:id', RecetaController.getRecetabyId)

recetaRouter.post('/upload/files',upload.single('file'), RecetaController.uploadFiles)


recetaRouter.get('/patologia/add', RecetaController.getPatologiaToRecetaAdd)

recetaRouter.get('/patologia/edit/:id', RecetaController.getPatologiaToRecetaEdit)

recetaRouter.get('/categoria/add', RecetaController.getCategoriaToRecetaAdd)

recetaRouter.get('/categoria/edit/:id', RecetaController.getCategoriaToRecetaEdit)

recetaRouter.get('/patologia/:idPatologia', RecetaController.getRecetabyPatologia)

recetaRouter.get('/paciente/:ndocu', RecetaController.getRecetabyPaciente)

recetaRouter.put('/:id', RecetaController.updateReceta)

recetaRouter.put('/inhabilitar/:id', RecetaController.disable)


recetaRouter.post('/',RecetaController.addReceta)

