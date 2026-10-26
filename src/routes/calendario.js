import express from "express";
import { CalendarioController } from "../controllers/calendario.js";
import { crearUpload } from "../middlewares/upload.js";

// Tipos y tamaños permitidos (los errores vuelven con un mensaje claro).
const upload = crearUpload({ tipos: ["imagen"], maxMB: { imagen: 5 } });

export const calendarioRouter = express.Router();

calendarioRouter.get('/', CalendarioController.getAll);
calendarioRouter.get('/fecha', CalendarioController.getByFecha);
calendarioRouter.get('/:id', CalendarioController.getById);
calendarioRouter.post('/', CalendarioController.add);
calendarioRouter.put('/:id', CalendarioController.update);
calendarioRouter.put('/inhabilitar/:id', CalendarioController.disable);
calendarioRouter.post('/upload/files', upload, CalendarioController.uploadFiles);
