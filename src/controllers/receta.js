import { RecetaModel } from "../models/receta.js";


export class RecetaController {
  static getAll = async (req, res) => {
    const recetas = await RecetaModel.getAll();
    if (!recetas?.err) {
      res.json(recetas);
    } else {
      res.json({ message: "Recetas no encontrados" }).status(404);
    }
  };

  static getRecetaFiltro = async (req, res) => {
    
    const {idsPatologias,idsCategorias}=req.body
    console.log(idsPatologias,idsCategorias)
    const recetas = await RecetaModel.getRecetaFiltro(idsPatologias,idsCategorias);

    if (!recetas?.err) {
      res.json(recetas);
    } else {
      res.json({ message: "Recetas no encontradas" }).status(404);
    }
  };

  static getRecetabyId = async (req, res) => {
    console.log("controller getRecetabyId");

    let id = req.params.id;
    const receta = await RecetaModel.getRecetabyId(id);
    if (!receta?.err) {
        console.log(receta)
      res.json(receta);
    } else {
      res.json({ message: "Receta no encontrada" }).status(404);
    }
  };

  static uploadFiles = async (req, res) => {
    // Aquí puedes manejar lógica adicional después de que Multer procese el archivo
    console.log(req.file)
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  };

  static getPatologiaToRecetaAdd = async (req, res) => {
    console.log("controller getPatologiaToRecetaAdd");
    const receta = await RecetaModel.getPatologiaToRecetaAdd();
    if (!receta?.err) {
      res.json(receta);
    } else {
      res.json({ message: "Patologias no encontradas" }).status(404);
    }
  };

  static getCategoriaToRecetaAdd = async (req, res) => {
    console.log("controller getCategoriaToRecetaAdd");
    const categoria = await RecetaModel.getCategoriaToRecetaAdd();
    if (!categoria?.err) {
      res.json(categoria);
    } else {
      res.json({ message: "categorias no encontradas" }).status(404);
    }
  };

  static getPatologiaToRecetaEdit = async (req, res) => {
    let id = req.params.id;
    const receta = await RecetaModel.getPatologiaToRecetaEdit(id);
    if (!receta?.err) {
      res.json(receta);
    } else {
      res.json({ message: "patologias no encontradas" }).status(404);
    }
  };

  static getCategoriaToRecetaEdit = async (req, res) => {
    let id = req.params.id;
    const categoria = await RecetaModel.getCategoriaToRecetaEdit(id);
    if (!categoria?.err) {
      res.json(categoria);
    } else {
      res.json({ message: "categorias no encontradas" }).status(404);
    }
  };

  static getRecetabyPatologia = async (req, res) => {
    let idPatologia = req.params.idPatologia;
    const receta = await RecetaModel.getRecetabyPatologia(idPatologia);
    if (!receta?.err) {
      res.json(receta);
    } else {
      res.json({ message: "Receta no encontrado" }).status(404);
    }
  };

  static getRecetabyPaciente = async (req, res) => {
    let ndocu = req.params.ndocu;
    const receta = await RecetaModel.getRecetabyPaciente(ndocu);
    if (!receta?.err) {
      res.json(receta);
    } else {
      res.json({ message: "Receta no encontrado" }).status(404);
    }
  };

  static updateReceta = async (req, res) => {
    let id = req.params.id;
    const receta = await RecetaModel.updateReceta(id, req.body);
    console.log(receta)
    if (!receta?.err) {
      res.json(receta);
    } else {
      res.json({ message: "Receta no encontrado" }).status(404);
    }
  };

  static addReceta = async (req, res) => {
    const newReceta = await RecetaModel.addReceta(req.body);
    console.log(newReceta)
    if (!newReceta?.err) {
      res.json(newReceta);
    } else {
      res.json({ message: newReceta?.err }).status(404);
    }
  };

  static disable = async (req, res) => {
    const {id}=req.params
    const result = await RecetaModel.disable(id);
    if (!result ?.err) {
      res.json(result );
    } else {
      res.json({ message: "No se pudo inhabilitar la Receta" }).status(404);
    }
  };

}
