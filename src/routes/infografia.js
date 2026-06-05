import express from "express";
import { InfografiaDietaController } from "../controllers/infografia.js";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const filename = fileURLToPath(import.meta.url);
const dirnamex = dirname(filename);

// Configuración de Multer para guardar archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(dirnamex, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPG, PNG) y PDF'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

export const infografiaRouter = express.Router();

infografiaRouter.get('/', InfografiaDietaController.getAll);
infografiaRouter.get('/categoria/:categoria', InfografiaDietaController.getByCategoria);
infografiaRouter.get('/:id', InfografiaDietaController.getById);
infografiaRouter.post('/', InfografiaDietaController.add);
infografiaRouter.put('/:id', InfografiaDietaController.update);
infografiaRouter.put('/inhabilitar/:id', InfografiaDietaController.disable);
infografiaRouter.post('/upload/files', upload.single('file'), InfografiaDietaController.uploadFiles);
