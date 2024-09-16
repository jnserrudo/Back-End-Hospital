import { EjercicioModel } from "../models/ejercicio.js";

export class EjercicioController {
  static getAll = async (req, res) => {
    const ejercicios = await EjercicioModel.getAll();
    if (!ejercicios?.err) {
      res.json(ejercicios);
    } else {
      res.json({ message: "Ejercicios no encontrados" }).status(404);
    }
  };


  static getEjercicioFiltro = async (req, res) => {
    
    const {idsPatologias,idsCategorias}=req.body
    console.log(idsPatologias,idsCategorias)
    const ejercicios = await EjercicioModel.getEjercicioFiltro(idsPatologias,idsCategorias);

    if (!ejercicios?.err) {
      res.json(ejercicios);
    } else {
      res.json({ message: "Ejercicios no encontrados" }).status(404);
    }
  };


  static getEjerciciobyId = async (req, res) => {
    let id = req.params.id;
    const ejercicio = await EjercicioModel.getEjerciciobyId(id);
    if (!ejercicio?.err) {
      res.json(ejercicio);
    } else {
      res.json({ message: "Ejercicio no encontrado" }).status(404);
    }
  };

  static updateEjercicio = async (req, res) => {
    let id = req.params.id;
    const ejercicio = await EjercicioModel.updateEjercicio(id, req.body);
    if (!ejercicio?.err) {
      res.json(ejercicio);
    } else {
      res.json({ message: "Ejercicio no encontrado" }).status(404);
    }
  };

  static addEjercicio = async (req, res) => {
    const newEjercicio = await EjercicioModel.addEjercicio(req.body);
    console.log(newEjercicio)
    if (!newEjercicio?.err) {
      res.json(newEjercicio);
    } else {
      res.json({ message: "Ejercicio no encontrado" }).status(404);
    }
  };

  static getPatologiaToEjercicioAdd = async (req, res) => {
    console.log("controller getPatologiaToEjercicioAdd");
    const ejercicio = await EjercicioModel.getPatologiaToEjercicioAdd();
    if (!ejercicio?.err) {
      res.json(ejercicio);
    } else {
      res.json({ message: "Patologias no encontradas" }).status(404);
    }
  };

  static getPatologiaToEjercicioEdit = async (req, res) => {
    let id = req.params.id;
    const ejercicio = await EjercicioModel.getPatologiaToEjercicioEdit(id);
    if (!ejercicio?.err) {
      res.json(ejercicio);
    } else {
      res.json({ message: "Patologias no encontrado" }).status(404);
    }
  };

  static getCategoriaToEjercicioAdd = async (req, res) => {
    console.log("controller getCategoriaToEjercicioAdd");
    const ejercicio = await EjercicioModel.getCategoriaToEjercicioAdd();
    if (!ejercicio?.err) {
      res.json(ejercicio);
    } else {
      res.json({ message: "Categorias no encontradas" }).status(404);
    }
  };

  static getCategoriaToEjercicioEdit = async (req, res) => {
    let id = req.params.id;
    const ejercicio = await EjercicioModel.getCategoriaToEjercicioEdit(id);
    if (!ejercicio?.err) {
      res.json(ejercicio);
    } else {
      res.json({ message: "Categorias no encontrado" }).status(404);
    }
  };

  static uploadVideo = async (req, res) => {
    console.log(req.file);
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  };

  static disable = async (req, res) => {
    const {id}=req.params
    console.log("req.params",req.params,id)
    const result = await EjercicioModel.disable(id);
    console.log(result)
    if (!result ?.err) {
      res.json(result );
    } else {
      res.json({ message: "No se pudo inhabilitar el ejercicio" }).status(404);
    }
  };
}
