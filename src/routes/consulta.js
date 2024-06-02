import express from "express";
import { ConsultaController } from "../controllers/consulta.js";


export const consultaRouter=express.Router()

consultaRouter.get('/',ConsultaController.getAll)

consultaRouter.get('/:dni',ConsultaController.getConsultaByDni)

consultaRouter.get('/:id',ConsultaController.getConsultaById)

consultaRouter.put('/:id',ConsultaController.updateConsulta)

consultaRouter.post('/',ConsultaController.addConsulta)

