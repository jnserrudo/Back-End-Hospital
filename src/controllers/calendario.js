import { CalendarioModel } from "../models/calendario.js";

export class CalendarioController {
  static getAll = async (req, res) => {
    const eventos = await CalendarioModel.getAll();
    if (!eventos?.err) {
      res.json(eventos);
    } else {
      res.json({ message: "Eventos no encontrados" }).status(404);
    }
  };

  static getByFecha = async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
    const eventos = await CalendarioModel.getByFecha(fechaInicio, fechaFin);
    if (!eventos?.err) {
      res.json(eventos);
    } else {
      res.json({ message: "Eventos no encontrados" }).status(404);
    }
  };

  static getById = async (req, res) => {
    const { id } = req.params;
    const evento = await CalendarioModel.getById(id);
    if (!evento?.err) {
      res.json(evento);
    } else {
      res.json({ message: "Evento no encontrado" }).status(404);
    }
  };

  static add = async (req, res) => {
    console.log("📅 [CALENDARIO] Intentando crear evento:", req.body);
    
    const newEvento = await CalendarioModel.add(req.body);
    
    if (!newEvento?.err) {
      console.log("✅ [CALENDARIO] Evento creado exitosamente:", newEvento);
      res.status(201).json(newEvento);
    } else {
      console.error("❌ [CALENDARIO] Error al crear evento:", newEvento.err);
      res.status(400).json({ 
        error: "Error al crear el evento",
        message: newEvento.err.message || "Error desconocido",
        details: newEvento.err
      });
    }
  };

  static update = async (req, res) => {
    const { id } = req.params;
    console.log(`📅 [CALENDARIO] Intentando actualizar evento ID ${id}:`, req.body);
    
    const evento = await CalendarioModel.update(id, req.body);
    
    if (!evento?.err) {
      console.log("✅ [CALENDARIO] Evento actualizado exitosamente:", evento);
      res.json(evento);
    } else {
      console.error("❌ [CALENDARIO] Error al actualizar evento:", evento.err);
      res.status(404).json({ 
        error: "Evento no encontrado",
        message: evento.err.message || "Error desconocido"
      });
    }
  };

  static disable = async (req, res) => {
    const { id } = req.params;
    console.log(`📅 [CALENDARIO] Intentando inhabilitar evento ID ${id}`);
    
    const result = await CalendarioModel.disable(id);
    
    if (!result?.err) {
      console.log("✅ [CALENDARIO] Evento inhabilitado exitosamente:", result);
      res.json(result);
    } else {
      console.error("❌ [CALENDARIO] Error al inhabilitar evento:", result.err);
      res.status(404).json({ 
        error: "No se pudo inhabilitar el evento",
        message: result.err.message || "Error desconocido"
      });
    }
  };

  static uploadFiles = async (req, res) => {
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  };
}
