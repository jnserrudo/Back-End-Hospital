import { InfografiaDietaModel } from "../models/infografia.js";

export class InfografiaDietaController {
  static getAll = async (req, res) => {
    const infografias = await InfografiaDietaModel.getAll();
    if (!infografias?.err) {
      res.json(infografias);
    } else {
      res.json({ message: "Infografías no encontradas" }).status(404);
    }
  };

  static getByCategoria = async (req, res) => {
    const { categoria } = req.params;
    const infografias = await InfografiaDietaModel.getByCategoria(categoria);
    if (!infografias?.err) {
      res.json(infografias);
    } else {
      res.json({ message: "Infografías no encontradas" }).status(404);
    }
  };

  static getById = async (req, res) => {
    let id = req.params.id;
    const infografia = await InfografiaDietaModel.getById(id);
    if (!infografia?.err) {
      res.json(infografia);
    } else {
      res.json({ message: "Infografía no encontrada" }).status(404);
    }
  };

  static add = async (req, res) => {
    const newInfografia = await InfografiaDietaModel.add(req.body);
    if (!newInfografia?.err) {
      res.json(newInfografia);
    } else {
      res.json({ message: "Error al crear la infografía" }).status(404);
    }
  };

  static update = async (req, res) => {
    let id = req.params.id;
    const infografia = await InfografiaDietaModel.update(id, req.body);
    if (!infografia?.err) {
      res.json(infografia);
    } else {
      res.json({ message: "Infografía no encontrada" }).status(404);
    }
  };

  static disable = async (req, res) => {
    const { id } = req.params;
    const result = await InfografiaDietaModel.disable(id);
    if (!result?.err) {
      res.json(result);
    } else {
      res.json({ message: "No se pudo inhabilitar la Infografía" }).status(404);
    }
  };

  static uploadFiles = async (req, res) => {
    console.log(req.file);
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  };
}
