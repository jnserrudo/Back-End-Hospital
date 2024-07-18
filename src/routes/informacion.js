import express from "express";
import { InformacionController } from "../controllers/informacion.js";


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



export const informacionRouter=express.Router()

informacionRouter.get('/', InformacionController.getAll)

informacionRouter.get('/:id', InformacionController.getInformacionbyId)

informacionRouter.put('/:id', InformacionController.updateInformacion)

informacionRouter.put('/inhabilitar/:id', InformacionController.disable)

informacionRouter.get('/patologia/add', InformacionController.getPatologiaToInformacionAdd)

informacionRouter.get('/patologia/edit/:id', InformacionController.getPatologiaToInformacionEdit)


informacionRouter.post('/',InformacionController.addInformacion)

informacionRouter.post('/upload/files', upload.single('file'), InformacionController.uploadVideo);
