import express from "express";
import { PatologiaController } from "../controllers/patologia.js";


export const patologiaRouter=express.Router()

patologiaRouter.get('/', PatologiaController.getAll)

patologiaRouter.get('/:id', PatologiaController.getPatologiabyId)

patologiaRouter.put('/:id', PatologiaController.updatePatologia)

patologiaRouter.post('/',PatologiaController.addPatologia)

