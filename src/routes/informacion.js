import express from "express";
import { InformacionController } from "../controllers/informacion.js";


export const informacionRouter=express.Router()

informacionRouter.get('/', InformacionController.getAll)

informacionRouter.get('/:id', InformacionController.getInformacionbyId)

informacionRouter.put('/:id', InformacionController.updateInformacion)

informacionRouter.post('/',InformacionController.addInformacion)

