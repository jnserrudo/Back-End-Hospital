import { sendError } from "../utils/http.js";
import { InfografiaDietaModel } from "../models/infografia.js";

export class InfografiaDietaController {
  static getAll = async (req, res) => {
    const infografias = await InfografiaDietaModel.getAll();
    if (!infografias?.err) {
      res.json(infografias);
    } else {
      sendError(res, infografias.err, "No pudimos cargar las infografías");
    }
  };

  static getByCategoria = async (req, res) => {
    const { categoria } = req.params;
    const infografias = await InfografiaDietaModel.getByCategoria(categoria);
    if (!infografias?.err) {
      res.json(infografias);
    } else {
      sendError(res, infografias.err, "No pudimos cargar las infografías");
    }
  };

  static getById = async (req, res) => {
    let id = req.params.id;
    const infografia = await InfografiaDietaModel.getById(id);
    if (!infografia?.err) {
      res.json(infografia);
    } else {
      sendError(res, infografia.err, "No pudimos cargar la infografía");
    }
  };

  static add = async (req, res) => {
    const newInfografia = await InfografiaDietaModel.add(req.body);
    if (!newInfografia?.err) {
      res.json(newInfografia);
    } else {
      sendError(res, newInfografia.err, "No pudimos guardar la infografía");
    }
  };

  static update = async (req, res) => {
    let id = req.params.id;
    const infografia = await InfografiaDietaModel.update(id, req.body);
    if (!infografia?.err) {
      res.json(infografia);
    } else {
      sendError(res, infografia.err, "No pudimos guardar los cambios de la infografía");
    }
  };

  static disable = async (req, res) => {
    const { id } = req.params;
    const result = await InfografiaDietaModel.disable(id);
    if (!result?.err) {
      res.json(result);
    } else {
      sendError(res, result.err, "No pudimos deshabilitar la infografía");
    }
  };

  static uploadFiles = async (req, res) => {
    // console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ message: "No recibimos ningún archivo. Elegí un archivo y volvé a intentar.", err: { message: "No recibimos ningún archivo. Elegí un archivo y volvé a intentar." } });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  };
}
