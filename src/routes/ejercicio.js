import express from "express";
import { EjercicioController } from "../controllers/ejercicio.js";



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


ejercicioRouter.post('/upload/files', upload.single('file'), EjercicioController.uploadVideo);

