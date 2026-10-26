import { AutoevaluacionModel } from "../models/autoevaluacion.js";
import { handle, AppError } from "../utils/http.js";
import { ROLES } from "../middlewares/auth.js";

const esStaff = (u) => u.rol === ROLES.ADMIN || u.rol === ROLES.PROFESIONAL;

export class AutoevaluacionController {
  // Solo pacientes; el paciente siempre sale de la sesión, nunca del cuerpo de la solicitud.
  static create = handle("No pudimos enviar la autoevaluación", async (req, res) => {
    if (!req.user.pacienteId) {
      throw new AppError(403, "Solo los pacientes pueden enviar autoevaluaciones.", "SIN_PERMISO");
    }
    const { profesionalId, ejercicioId, tipo, respuestas } = req.body || {};
    const creada = await AutoevaluacionModel.create({ pacienteId: req.user.pacienteId, profesionalId, ejercicioId, tipo, respuestas });
    res.status(201).json(creada);
  });

  static getMias = handle("No pudimos cargar tus autoevaluaciones", async (req, res) => {
    if (!req.user.pacienteId) {
      throw new AppError(403, "Esta lista es solo para pacientes. El equipo las ve en Administración › Autoevaluaciones.", "SIN_PERMISO");
    }
    res.json(await AutoevaluacionModel.getDelPaciente(req.user.pacienteId));
  });

  static getAll = handle("No pudimos cargar las autoevaluaciones", async (req, res) => {
    const { pacienteId, profesionalId, tipo, desde, hasta, patologiaId, revisada } = req.query;
    res.json(await AutoevaluacionModel.getAll({ pacienteId, profesionalId, tipo, desde, hasta, patologiaId, revisada }));
  });

  // Personal de salud, o el paciente dueño de la autoevaluación.
  static getById = handle("No pudimos cargar la autoevaluación", async (req, res) => {
    const a = await AutoevaluacionModel.getById(req.params.id);
    if (!esStaff(req.user) && a.pacienteId !== req.user.pacienteId) {
      throw new AppError(403, "No podés ver la autoevaluación de otra persona.", "SIN_PERMISO");
    }
    res.json(a);
  });

  static revisar = handle("No pudimos guardar la revisión", async (req, res) => {
    res.json(await AutoevaluacionModel.revisar(req.params.id, req.body || {}, req.user));
  });
}
