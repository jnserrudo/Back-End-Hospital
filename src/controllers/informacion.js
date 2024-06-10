import { InformacionModel } from "../models/informacion.js"

export class InformacionController{
    static getAll=async(req,res)=>{
        const informacions=await InformacionModel.getAll()
        if(!informacions?.err){
            res.json(informacions)
        }else{
            res.json({message:"Informacions no encontrados"}).status(404)
        }
    }

    static getInformacionbyId=async(req,res)=>{
        let id=req.params.id
        const informacion=await InformacionModel.getInformacionbyDni(dni)
        if(!informacion?.err){
            res.json(informacion)
        }else{
            res.json({message:"Informacion no encontrado"}).status(404)
        }
    }

    static updateInformacion=async(req,res)=>{
        let dni=req.params.dni
        const informacion=await InformacionModel.updateInformacion(dni,req.body)
        if(!informacion?.err){
            res.json(informacion)
        }else{
            res.json({message:"Informacion no encontrado"}).status(404)
        }
    }

    static addInformacion=async(req,res)=>{
        const newInformacion=await InformacionModel.addInformacion(req.body)
        if(!newInformacion?.err){
            res.json(newInformacion)
        }else{
            res.json({message:"Informacion no encontrado"}).status(404)
        }
    }
}