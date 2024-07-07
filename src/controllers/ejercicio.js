import { EjercicioModel } from "../models/ejercicio.js"

export class EjercicioController{
    static getAll=async(req,res)=>{
        const ejercicios=await EjercicioModel.getAll()
        if(!ejercicios?.err){
            res.json(ejercicios)
        }else{
            res.json({message:"Ejercicios no encontrados"}).status(404)
        }
    }

    static getEjerciciobyId=async(req,res)=>{
        let id=req.params.id
        const ejercicio=await EjercicioModel.getEjerciciobyDni(id)
        if(!ejercicio?.err){
            res.json(ejercicio)
        }else{
            res.json({message:"Ejercicio no encontrado"}).status(404)
        }
    }

    static updateEjercicio=async(req,res)=>{
        let id=req.params.id
        const ejercicio=await EjercicioModel.updateEjercicio(id,req.body)
        if(!ejercicio?.err){
            res.json(ejercicio)
        }else{
            res.json({message:"Ejercicio no encontrado"}).status(404)
        }
    }

    static addEjercicio=async(req,res)=>{
        const newEjercicio=await EjercicioModel.addEjercicio(req.body)
        if(!newEjercicio?.err){
            res.json(newEjercicio)
        }else{
            res.json({message:"Ejercicio no encontrado"}).status(404)
        }
    }
}