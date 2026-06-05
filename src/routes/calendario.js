import express from "express";
import { CalendarioController } from "../controllers/calendario.js";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const filename = fileURLToPath(import.meta.url);
const dirnamex = dirname(filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(dirnamex, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

export const calendarioRouter = express.Router();

calendarioRouter.get('/', CalendarioController.getAll);
calendarioRouter.get('/fecha', CalendarioController.getByFecha);
calendarioRouter.get('/:id', CalendarioController.getById);
calendarioRouter.post('/', CalendarioController.add);
calendarioRouter.put('/:id', CalendarioController.update);
calendarioRouter.put('/inhabilitar/:id', CalendarioController.disable);
calendarioRouter.post('/upload/files', upload.single('file'), CalendarioController.uploadFiles);
