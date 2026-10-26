import { sendError, AppError } from "../utils/http.js";
import { PrismaClient } from "@prisma/client";
import { ROLES } from "../middlewares/auth.js";

const prisma = new PrismaClient();
import { personalizar, sanitizarUrlVideo } from "../utils/contenido.js";
import { RecetaModel } from "../models/receta.js";


export class RecetaController {
  static getAll = async (req, res) => {
    const recetas = await RecetaModel.getAll();
    if (!recetas?.err) {
      res.json(await personalizar(req, recetas));
    } else {
      sendError(res, recetas.err, "No pudimos cargar las recetas");
    }
  };

  static getRecetaFiltro = async (req, res) => {
    
    const {idsPatologias,idsCategorias}=req.body
    // console.log(idsPatologias,idsCategorias)
    const recetas = await RecetaModel.getRecetaFiltro(idsPatologias,idsCategorias);

    if (!recetas?.err) {
      res.json(await personalizar(req, recetas));
    } else {
      sendError(res, recetas.err, "No pudimos cargar las recetas");
    }
  };

  static getRecetabyId = async (req, res) => {
    // console.log("controller getRecetabyId");

    let id = req.params.id;
    const receta = await RecetaModel.getRecetabyId(id);
    if (!receta?.err) {
        // console.log(receta)
      res.json(receta);
    } else {
      sendError(res, receta.err, "No pudimos cargar la receta");
    }
  };

  static uploadFiles = async (req, res) => {
    // Aquí puedes manejar lógica adicional después de que Multer procese el archivo
    // console.log(req.file)
    if (!req.file) {
      return res.status(400).json({ message: "No recibimos ningún archivo. Elegí un archivo y volvé a intentar.", err: { message: "No recibimos ningún archivo. Elegí un archivo y volvé a intentar." } });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  };

  static getPatologiaToRecetaAdd = async (req, res) => {
    // console.log("controller getPatologiaToRecetaAdd");
    const receta = await RecetaModel.getPatologiaToRecetaAdd();
    if (!receta?.err) {
      res.json(receta);
    } else {
      sendError(res, receta.err, "No pudimos cargar la lista de patologías");
    }
  };

  static getCategoriaToRecetaAdd = async (req, res) => {
    // console.log("controller getCategoriaToRecetaAdd");
    const categoria = await RecetaModel.getCategoriaToRecetaAdd();
    if (!categoria?.err) {
      res.json(categoria);
    } else {
      sendError(res, categoria.err, "No pudimos cargar la lista de categorías");
    }
  };

  static getPatologiaToRecetaEdit = async (req, res) => {
    let id = req.params.id;
    const receta = await RecetaModel.getPatologiaToRecetaEdit(id);
    if (!receta?.err) {
      res.json(receta);
    } else {
      sendError(res, receta.err, "No pudimos cargar la lista de patologías");
    }
  };

  static getCategoriaToRecetaEdit = async (req, res) => {
    let id = req.params.id;
    const categoria = await RecetaModel.getCategoriaToRecetaEdit(id);
    if (!categoria?.err) {
      res.json(categoria);
    } else {
      sendError(res, categoria.err, "No pudimos cargar la lista de categorías");
    }
  };

  static getRecetabyPatologia = async (req, res) => {
    let idPatologia = req.params.idPatologia;
    const receta = await RecetaModel.getRecetabyPatologia(idPatologia);
    if (!receta?.err) {
      res.json(receta);
    } else {
      sendError(res, receta.err, "No pudimos cargar las recetas");
    }
  };

  static getRecetabyPaciente = async (req, res) => {
    // Un paciente siempre ve sus propias recetas; el personal puede consultar por DNI.
    try {
      let user = req.user;
      if (user.rol !== ROLES.PACIENTE) {
        const dni = +String(req.params.ndocu || "").replace(/\D/g, "");
        const u = dni
          ? await prisma.usuario.findFirst({ where: { dni, idRol: ROLES.PACIENTE }, include: { paciente: true } })
          : null;
        if (!u?.paciente) {
          throw new AppError(404, "No encontramos un paciente con ese DNI.", "NO_ENCONTRADO");
        }
        user = { rol: ROLES.PACIENTE, pacienteId: u.paciente.id };
      }
      const recetas = await RecetaModel.getAll();
      if (recetas?.err) throw recetas.err;
      res.json(await personalizar({ user }, recetas));
    } catch (error) {
      sendError(res, error, "No pudimos cargar las recetas del paciente");
    }
  };

  static updateReceta = async (req, res) => {
    let id = req.params.id;
    const receta = await RecetaModel.updateReceta(id, req.body);
    // console.log(receta)
    if (!receta?.err) {
      res.json(receta);
    } else {
      sendError(res, receta.err, "No pudimos guardar los cambios de la receta");
    }
  };

  static addReceta = async (req, res) => {
    const newReceta = await RecetaModel.addReceta(req.body);
    // console.log(newReceta)
    if (!newReceta?.err) {
      res.json(newReceta);
    } else {
      sendError(res, newReceta.err, "No pudimos guardar la receta");
    }
  };

  static disable = async (req, res) => {
    const {id}=req.params
    const result = await RecetaModel.disable(id);
    if (!result?.err) {
      res.json(result );
    } else {
      sendError(res, result.err, "No pudimos deshabilitar la receta");
    }
  };

}
