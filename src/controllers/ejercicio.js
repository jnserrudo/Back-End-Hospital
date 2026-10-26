import { sendError } from "../utils/http.js";
import { personalizar, sanitizarUrlVideo } from "../utils/contenido.js";
import { EjercicioModel } from "../models/ejercicio.js";

export class EjercicioController {
  static getAll = async (req, res) => {
    const ejercicios = await EjercicioModel.getAll();
    if (!ejercicios?.err) {
      res.json(await personalizar(req, ejercicios));
    } else {
      sendError(res, ejercicios.err, "No pudimos cargar los ejercicios");
    }
  };


  static getEjercicioFiltro = async (req, res) => {
    
    const {idsPatologias,idsCategorias}=req.body
    // console.log(idsPatologias,idsCategorias)
    const ejercicios = await EjercicioModel.getEjercicioFiltro(idsPatologias,idsCategorias);

    if (!ejercicios?.err) {
      res.json(await personalizar(req, ejercicios));
    } else {
      sendError(res, ejercicios.err, "No pudimos cargar los ejercicios");
    }
  };


  static getEjerciciobyId = async (req, res) => {
    let id = req.params.id;
    const ejercicio = await EjercicioModel.getEjerciciobyId(id);
    if (!ejercicio?.err) {
      res.json(ejercicio);
    } else {
      sendError(res, ejercicio.err, "No pudimos cargar el ejercicio");
    }
  };

  static updateEjercicio = async (req, res) => {
    try {
      sanitizarUrlVideo(req.body);
    } catch (error) {
      return sendError(res, error, "No pudimos guardar el video");
    }
    let id = req.params.id;
    const ejercicio = await EjercicioModel.updateEjercicio(id, req.body);
    if (!ejercicio?.err) {
      res.json(ejercicio);
    } else {
      sendError(res, ejercicio.err, "No pudimos guardar los cambios del ejercicio");
    }
  };

  static addEjercicio = async (req, res) => {
    try {
      sanitizarUrlVideo(req.body);
    } catch (error) {
      return sendError(res, error, "No pudimos guardar el video");
    }
    const newEjercicio = await EjercicioModel.addEjercicio(req.body);
    // console.log(newEjercicio)
    if (!newEjercicio?.err) {
      res.json(newEjercicio);
    } else {
      sendError(res, newEjercicio.err, "No pudimos guardar el ejercicio");
    }
  };

  static getPatologiaToEjercicioAdd = async (req, res) => {
    // console.log("controller getPatologiaToEjercicioAdd");
    const ejercicio = await EjercicioModel.getPatologiaToEjercicioAdd();
    if (!ejercicio?.err) {
      res.json(ejercicio);
    } else {
      sendError(res, ejercicio.err, "No pudimos cargar la lista de patologías");
    }
  };

  static getPatologiaToEjercicioEdit = async (req, res) => {
    let id = req.params.id;
    const ejercicio = await EjercicioModel.getPatologiaToEjercicioEdit(id);
    if (!ejercicio?.err) {
      res.json(ejercicio);
    } else {
      sendError(res, ejercicio.err, "No pudimos cargar la lista de patologías");
    }
  };

  static getCategoriaToEjercicioAdd = async (req, res) => {
    // console.log("controller getCategoriaToEjercicioAdd");
    const ejercicio = await EjercicioModel.getCategoriaToEjercicioAdd();
    if (!ejercicio?.err) {
      res.json(ejercicio);
    } else {
      sendError(res, ejercicio.err, "No pudimos cargar la lista de categorías");
    }
  };

  static getCategoriaToEjercicioEdit = async (req, res) => {
    let id = req.params.id;
    const ejercicio = await EjercicioModel.getCategoriaToEjercicioEdit(id);
    if (!ejercicio?.err) {
      res.json(ejercicio);
    } else {
      sendError(res, ejercicio.err, "No pudimos cargar la lista de categorías");
    }
  };

  static uploadVideo = async (req, res) => {
    // console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ message: "No recibimos ningún archivo. Elegí un archivo y volvé a intentar.", err: { message: "No recibimos ningún archivo. Elegí un archivo y volvé a intentar." } });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  };

  static disable = async (req, res) => {
    const {id}=req.params
    // console.log("req.params",req.params,id)
    const result = await EjercicioModel.disable(id);
    // console.log(result)
    if (!result?.err) {
      res.json(result );
    } else {
      sendError(res, result.err, "No pudimos deshabilitar el ejercicio");
    }
  };
}
