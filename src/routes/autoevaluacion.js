import express from "express";
import { AutoevaluacionController } from "../controllers/autoevaluacion.js";

export const autoevaluacionRouter = express.Router();

autoevaluacionRouter.post("/", AutoevaluacionController.create);
autoevaluacionRouter.get("/", AutoevaluacionController.getAll);
