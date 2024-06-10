import { RecetaModel } from "../models/receta.js"

export class RecetaController{
    static getAll=async(req,res)=>{
        const recetas=await RecetaModel.getAll()
        if(!recetas?.err){
            res.json(recetas)
        }else{
            res.json({message:"Recetas no encontrados"}).status(404)
        }
    }

    static getRecetabyId=async(req,res)=>{
        let id=req.params.id
        const receta=await RecetaModel.getRecetabyId(id)
        if(!receta?.err){
            res.json(receta)
        }else{
            res.json({message:"Receta no encontrado"}).status(404)
        }
    }

    static updateReceta=async(req,res)=>{
        let dni=req.params.dni
        const receta=await RecetaModel.updateReceta(dni,req.body)
        if(!receta?.err){
            res.json(receta)
        }else{
            res.json({message:"Receta no encontrado"}).status(404)
        }
    }

    static addReceta=async(req,res)=>{
        const newReceta=await RecetaModel.addReceta(req.body)
        if(!newReceta?.err){
            res.json(newReceta)
        }else{
            res.json({message:"Receta no encontrado"}).status(404)
        }
    }
}