import { sendError } from "../utils/http.js";
import { CategoriaModel } from "../models/categorias.js"

export class CategoriaController{
    static getAll=async(req,res)=>{
        
        const categorias=await CategoriaModel.getAll()
        if (!categorias?.err) {
            res.json(categorias)
        } else {
      sendError(res, categorias.err, "No pudimos cargar las categorías");}
    }

    static getCategoriabyId=async(req,res)=>{
        let id=req.params.id
        const categoria=await CategoriaModel.getCategoriabyId(id)
        if (!categoria?.err) {
            res.json(categoria)
        } else {
      sendError(res, categoria.err, "No pudimos cargar la categoría");}
    }

    static updateCategoria=async(req,res)=>{
        let id=req.params.id
        const categoria=await CategoriaModel.updateCategoria(id,req.body)
        if (!categoria?.err) {
            res.json(categoria)
        } else {
      sendError(res, categoria.err, "No pudimos guardar los cambios de la categoría");}
    }

    static addCategoria=async(req,res)=>{
        const newCategoria=await CategoriaModel.addCategoria(req.body)
        if (!newCategoria?.err) {
            res.json(newCategoria)
        } else {
      sendError(res, newCategoria.err, "No pudimos guardar la categoría");}
    }

    static disable = async (req, res) => {
        const {id}=req.params
        const result = await CategoriaModel.disable(id);
        if (!result?.err) {
          res.json(result );
        } else {
      sendError(res, result.err, "No pudimos deshabilitar la categoría");
        }
      };

}