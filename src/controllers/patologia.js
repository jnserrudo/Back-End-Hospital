import { PatologiaModel } from "../models/patologia.js"

export class PatologiaController{
    static getAll=async(req,res)=>{
        const patologias=await PatologiaModel.getAll()
        if(!patologias?.err){
            res.json(patologias)
        }else{
            res.json({message:"Patologias no encontrados"}).status(404)
        }
    }

    static getPatologiabyId=async(req,res)=>{
        let id=req.params.id
        const patologia=await PatologiaModel.getPatologiabyDni(id)
        if(!patologia?.err){
            res.json(patologia)
        }else{
            res.json({message:"Patologia no encontrado"}).status(404)
        }
    }

    static updatePatologia=async(req,res)=>{
        let dni=req.params.dni
        const patologia=await PatologiaModel.updatePatologia(dni,req.body)
        if(!patologia?.err){
            res.json(patologia)
        }else{
            res.json({message:"Patologia no encontrado"}).status(404)
        }
    }

    static addPatologia=async(req,res)=>{
        const newPatologia=await PatologiaModel.addPatologia(req.body)
        if(!newPatologia?.err){
            res.json(newPatologia)
        }else{
            res.json({message:"Patologia no encontrado"}).status(404)
        }
    }
}