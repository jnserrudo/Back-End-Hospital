import { CategoriaModel } from "../models/categorias.js"

export class CategoriaController{
    static getAll=async(req,res)=>{
        
        const categorias=await CategoriaModel.getAll()
        if(!categorias?.err){
            res.json(categorias)
        }else{
            res.json({message:"Categorias no encontrados"}).status(404)
        }
    }

    static getCategoriabyId=async(req,res)=>{
        let id=req.params.id
        const categoria=await CategoriaModel.getCategoriabyId(id)
        if(!categoria?.err){
            res.json(categoria)
        }else{
            res.json({message:"Categoria no encontrado"}).status(404)
        }
    }

    static updateCategoria=async(req,res)=>{
        let id=req.params.id
        const categoria=await CategoriaModel.updateCategoria(id,req.body)
        if(!categoria?.err){
            res.json(categoria)
        }else{
            res.json({message:"Categoria no encontrado"}).status(404)
        }
    }

    static addCategoria=async(req,res)=>{
        const newCategoria=await CategoriaModel.addCategoria(req.body)
        if(!newCategoria?.err){
            res.json(newCategoria)
        }else{
            res.json({message:"Categoria no encontrado"}).status(404)
        }
    }

    static disable = async (req, res) => {
        const {id}=req.params
        const result = await CategoriaModel.disable(id);
        if (!result ?.err) {
          res.json(result );
        } else {
          res.json({ message: "No se pudo inhabilitar la Categoria" }).status(404);
        }
      };

}