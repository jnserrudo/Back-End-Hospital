import { sendError } from "../utils/http.js";
import { personalizar, sanitizarUrlVideo } from "../utils/contenido.js";
import { InformacionModel } from "../models/informacion.js";

export class InformacionController {
  static getAll = async (req, res) => {
    const informacions = await InformacionModel.getAll();
    if (!informacions?.err) {
      res.json(await personalizar(req, informacions));
    } else {
      sendError(res, informacions.err, "No pudimos cargar la información");
    }
  };

  static getInfoFiltro = async (req, res) => {
    
    const {idsPatologias,idsCategorias}=req.body
    // console.log(idsPatologias,idsCategorias)
    const informacions = await InformacionModel.getInfoFiltro(idsPatologias,idsCategorias);

    if (!informacions?.err) {
      res.json(await personalizar(req, informacions));
    } else {
      sendError(res, informacions.err, "No pudimos cargar la información");
    }
  };

  static getInformacionbyId = async (req, res) => {
    let id = req.params.id;
    const informacion = await InformacionModel.getInformacionbyId(id);
    if (!informacion?.err) {
      res.json(informacion);
    } else {
      sendError(res, informacion.err, "No pudimos cargar el contenido de información");
    }
  };

  static updateInformacion = async (req, res) => {
    try {
      sanitizarUrlVideo(req.body);
    } catch (error) {
      return sendError(res, error, "No pudimos guardar el video");
    }
    let id = req.params.id;
    const informacion = await InformacionModel.updateInformacion(id, req.body);
    // console.log(informacion)
    if (!informacion?.err) {
      res.json(informacion);
    } else {
      sendError(res, informacion.err, "No pudimos guardar los cambios del contenido de información");
    }
  };

  static addInformacion = async (req, res) => {
    try {
      sanitizarUrlVideo(req.body);
    } catch (error) {
      return sendError(res, error, "No pudimos guardar el video");
    }
    const newInformacion = await InformacionModel.addInformacion(req.body);
    // console.log(newInformacion)
    if (!newInformacion?.err) {
      res.json(newInformacion);
    } else {
      sendError(res, newInformacion.err, "No pudimos guardar el contenido de información");
    }
  };

  static getPatologiaToInformacionAdd = async (req, res) => {
    // console.log("controller getPatologiaToInformacionAdd");
    const informacion = await InformacionModel.getPatologiaToInformacionAdd();
    if (!informacion?.err) {
      res.json(informacion);
    } else {
      sendError(res, informacion.err, "No pudimos cargar la lista de patologías");
    }
  };

  static getPatologiaToInformacionEdit = async (req, res) => {
    let id = req.params.id;
    const informacion = await InformacionModel.getPatologiaToInformacionEdit(id);
    if (!informacion?.err) {
      res.json(informacion);
    } else {
      sendError(res, informacion.err, "No pudimos cargar la lista de patologías");
    }
  };

  static getCategoriaToInformacionAdd = async (req, res) => {
    // console.log("controller getCategoriaToInformacionAdd");
    const categoria = await InformacionModel.getCategoriaToInformacionAdd();
    if (!categoria?.err) {
      res.json(categoria);
    } else {
      sendError(res, categoria.err, "No pudimos cargar la lista de categorías");
    }
  };

  static getCategoriaToInformacionEdit = async (req, res) => {
    let id = req.params.id;
    const categoria = await InformacionModel.getCategoriaToInformacionEdit(id);
    if (!categoria?.err) {
      res.json(categoria);
    } else {
      sendError(res, categoria.err, "No pudimos cargar la lista de categorías");
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
    // console.log(id)
    const result = await InformacionModel.disable(id);
    // console.log(result)
    if (!result?.err) {
      res.json(result );
    } else {
      sendError(res, result.err, "No pudimos deshabilitar el contenido de información");
    }
  };
}
