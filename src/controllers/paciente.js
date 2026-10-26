import { PacienteModel } from "../models/paciente.js";
import { EjercicioModel } from "../models/ejercicio.js";
import { InformacionModel } from "../models/informacion.js";
import { handle, AppError } from "../utils/http.js";
import { personalizar } from "../utils/contenido.js";
import { ROLES } from "../middlewares/auth.js";

// Para un paciente, siempre usamos su propia cuenta; el personal puede consultar cualquiera.
const resolverUsuarioObjetivo = async (req) => {
  if (req.user.rol === ROLES.PACIENTE) return req.user;
  const p = await PacienteModel.getPacienteByUsuario(req.params.idUsuario);
  return { rol: ROLES.PACIENTE, pacienteId: p.id };
};

const contenidoDe = async (Model, user) => {
  const items = await Model.getAll();
  if (items?.err) throw items.err;
  return personalizar({ user }, items);
};

export class PacienteController {
  static getAll = handle("No pudimos cargar la lista de pacientes", async (req, res) => {
    res.json(await PacienteModel.getAll());
  });

  static getPacientebyId = handle("No pudimos cargar los datos del paciente", async (req, res) => {
    const p = await PacienteModel.getPacientebyId(req.params.id);
    if (req.user.rol === ROLES.PACIENTE && req.user.pacienteId !== p.id) {
      throw new AppError(403, "Solo podés ver tus propios datos.", "SIN_PERMISO");
    }
    res.json(p);
  });

  static HabilitarPaciente = handle("No pudimos habilitar al paciente", async (req, res) => {
    const { pacienteId, motivo } = req.body || {};
    res.json(await PacienteModel.cambiarHabilitacion(pacienteId, req.user.id, motivo, true));
  });

  static DeshabilitarPaciente = handle("No pudimos deshabilitar al paciente", async (req, res) => {
    const { pacienteId, motivo } = req.body || {};
    res.json(await PacienteModel.cambiarHabilitacion(pacienteId, req.user.id, motivo, false));
  });

  static getInformacionxPaciente = handle("No pudimos cargar la información del paciente", async (req, res) => {
    res.json(await contenidoDe(InformacionModel, await resolverUsuarioObjetivo(req)));
  });

  static getEjerciciosxPaciente = handle("No pudimos cargar los ejercicios del paciente", async (req, res) => {
    res.json(await contenidoDe(EjercicioModel, await resolverUsuarioObjetivo(req)));
  });

  static updatePaciente = handle("No pudimos guardar los cambios del paciente", async (req, res) => {
    res.json(await PacienteModel.updatePaciente(req.params.id, req.body, req.user));
  });

  static addPaciente = handle("No pudimos crear el paciente", async (req, res) => {
    res.status(201).json(await PacienteModel.addPaciente(req.body));
  });

  static disable = handle("No pudimos deshabilitar al paciente", async (req, res) => {
    res.json(await PacienteModel.cambiarHabilitacion(req.params.id, req.user.id, req.body?.motivo, false));
  });
}
