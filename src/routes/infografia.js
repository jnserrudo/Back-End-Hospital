import express from "express";
import { InfografiaDietaController } from "../controllers/infografia.js";
import { crearUpload } from "../middlewares/upload.js";

// Tipos y tamaños permitidos (los errores vuelven con un mensaje claro).
const upload = crearUpload({ tipos: ["imagen", "pdf"], maxMB: { imagen: 5, pdf: 10 } });

export const infografiaRouter = express.Router();

infografiaRouter.get('/', InfografiaDietaController.getAll);
infografiaRouter.get('/categoria/:categoria', InfografiaDietaController.getByCategoria);
infografiaRouter.get('/:id', InfografiaDietaController.getById);
infografiaRouter.post('/', InfografiaDietaController.add);
infografiaRouter.put('/:id', InfografiaDietaController.update);
infografiaRouter.put('/inhabilitar/:id', InfografiaDietaController.disable);
infografiaRouter.post('/upload/files', upload, InfografiaDietaController.uploadFiles);
