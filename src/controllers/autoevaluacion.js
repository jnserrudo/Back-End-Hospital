import { AutoevaluacionModel } from "../models/autoevaluacion.js";

export class AutoevaluacionController {
  static create = async (req, res) => {
    const result = await AutoevaluacionModel.create(req.body);
    if (!result.err) {
      res.status(201).json(result);
    } else {
      res.status(500).json({
        message: "No se pudo registrar la autoevaluación",
        error: result.err,
      });
    }
  };

  static getAll = async (req, res) => {
    const filters = {
      pacienteId: req.query.pacienteId || null,
      profesionalId: req.query.profesionalId || null,
      tipo: req.query.tipo || null,
    };
    const result = await AutoevaluacionModel.getAll(filters);
    if (!result.err) {
      res.json(result);
    } else {
      res.status(500).json({
        message: "No se pudieron traer las autoevaluaciones",
        error: result.err,
      });
    }
  };
}
