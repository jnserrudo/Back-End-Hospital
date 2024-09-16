import { InformacionModel } from "../models/informacion.js";

export class InformacionController {
  static getAll = async (req, res) => {
    const informacions = await InformacionModel.getAll();
    if (!informacions?.err) {
      res.json(informacions);
    } else {
      res.json({ message: "Informacions no encontrados" }).status(404);
    }
  };

  static getInfoFiltro = async (req, res) => {
    
    const {idsPatologias,idsCategorias}=req.body
    console.log(idsPatologias,idsCategorias)
    const informacions = await InformacionModel.getInfoFiltro(idsPatologias,idsCategorias);

    if (!informacions?.err) {
      res.json(informacions);
    } else {
      res.json({ message: "Informacions no encontrados" }).status(404);
    }
  };

  static getInformacionbyId = async (req, res) => {
    let id = req.params.id;
    const informacion = await InformacionModel.getInformacionbyId(id);
    if (!informacion?.err) {
      res.json(informacion);
    } else {
      res.json({ message: "Informacion no encontrado" }).status(404);
    }
  };

  static updateInformacion = async (req, res) => {
    let id = req.params.id;
    const informacion = await InformacionModel.updateInformacion(id, req.body);
    console.log(informacion)
    if (!informacion?.err) {
      res.json(informacion);
    } else {
      res.json({ message: "Informacion no encontrado" }).status(404);
    }
  };

  static addInformacion = async (req, res) => {
    const newInformacion = await InformacionModel.addInformacion(req.body);
    console.log(newInformacion)
    if (!newInformacion?.err) {
      res.json(newInformacion);
    } else {
      res.json({ message: "No se pudo agregar la informacion" }).status(404);
    }
  };

  static getPatologiaToInformacionAdd = async (req, res) => {
    console.log("controller getPatologiaToInformacionAdd");
    const informacion = await InformacionModel.getPatologiaToInformacionAdd();
    if (!informacion?.err) {
      res.json(informacion);
    } else {
      res.json({ message: "Patologias no encontradas" }).status(404);
    }
  };

  static getPatologiaToInformacionEdit = async (req, res) => {
    let id = req.params.id;
    const informacion = await InformacionModel.getPatologiaToInformacionEdit(id);
    if (!informacion?.err) {
      res.json(informacion);
    } else {
      res.json({ message: "Informacion no encontrado" }).status(404);
    }
  };

  static getCategoriaToInformacionAdd = async (req, res) => {
    console.log("controller getCategoriaToInformacionAdd");
    const categoria = await InformacionModel.getCategoriaToInformacionAdd();
    if (!categoria?.err) {
      res.json(categoria);
    } else {
      res.json({ message: "Categoria no encontradas" }).status(404);
    }
  };

  static getCategoriaToInformacionEdit = async (req, res) => {
    let id = req.params.id;
    const categoria = await InformacionModel.getCategoriaToInformacionEdit(id);
    if (!categoria?.err) {
      res.json(categoria);
    } else {
      res.json({ message: "Categorias no encontradas" }).status(404);
    }
  };




  static uploadVideo = async (req, res) => {
    console.log(req.file);
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  };

  static disable = async (req, res) => {
    const {id}=req.params
    console.log(id)
    const result = await InformacionModel.disable(id);
    console.log(result)
    if (!result ?.err) {
      res.json(result );
    } else {
      res.json({ message: "No se pudo inhabilitar la informacion" }).status(404);
    }
  };
}
