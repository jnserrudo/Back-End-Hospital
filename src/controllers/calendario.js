import { sendError } from "../utils/http.js";
import { CalendarioModel } from "../models/calendario.js";
import { patologiasDelPaciente } from "../utils/contenido.js";

// Un paciente ve los eventos generales y los de sus patologías; el equipo ve todos.
const soloDelPaciente = async (req, eventos) => {
  const ids = await patologiasDelPaciente(req.user);
  if (ids === null || !Array.isArray(eventos)) return eventos;
  return eventos.filter((e) => !e.patologiaId || ids.includes(e.patologiaId));
};

export class CalendarioController {
  static getAll = async (req, res) => {
    const eventos = await CalendarioModel.getAll();
    if (!eventos?.err) {
      res.json(await soloDelPaciente(req, eventos));
    } else {
      sendError(res, eventos.err, "No pudimos cargar los eventos");
    }
  };

  static getByFecha = async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
    const eventos = await CalendarioModel.getByFecha(fechaInicio, fechaFin);
    if (!eventos?.err) {
      res.json(await soloDelPaciente(req, eventos));
    } else {
      sendError(res, eventos.err, "No pudimos cargar los eventos");
    }
  };

  static getById = async (req, res) => {
    const { id } = req.params;
    const evento = await CalendarioModel.getById(id);
    if (!evento?.err) {
      res.json(evento);
    } else {
      sendError(res, evento.err, "No pudimos cargar el evento");
    }
  };

  static add = async (req, res) => {
    // console.log("📅 [CALENDARIO] Intentando crear evento:", req.body);
    
    const newEvento = await CalendarioModel.add(req.body);
    
    if (!newEvento?.err) {
      // console.log("✅ [CALENDARIO] Evento creado exitosamente:", newEvento);
      res.status(201).json(newEvento);
    } else {
      sendError(res, newEvento.err, "No pudimos guardar el evento");
    }
  };

  static update = async (req, res) => {
    const { id } = req.params;
    // console.log(`📅 [CALENDARIO] Intentando actualizar evento ID ${id}:`, req.body);
    
    const evento = await CalendarioModel.update(id, req.body);
    
    if (!evento?.err) {
      // console.log("✅ [CALENDARIO] Evento actualizado exitosamente:", evento);
      res.json(evento);
    } else {
      sendError(res, evento.err, "No pudimos guardar los cambios del evento");
    }
  };

  static disable = async (req, res) => {
    const { id } = req.params;
    // console.log(`📅 [CALENDARIO] Intentando inhabilitar evento ID ${id}`);
    
    const result = await CalendarioModel.disable(id);
    
    if (!result?.err) {
      // console.log("✅ [CALENDARIO] Evento inhabilitado exitosamente:", result);
      res.json(result);
    } else {
      sendError(res, result.err, "No pudimos deshabilitar el evento");
    }
  };

  static uploadFiles = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No recibimos ningún archivo. Elegí un archivo y volvé a intentar.", err: { message: "No recibimos ningún archivo. Elegí un archivo y volvé a intentar." } });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  };
}
