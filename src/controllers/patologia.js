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
        const patologia=await PatologiaModel.getPatologiabyId(id)
        if(!patologia?.err){
            res.json(patologia)
        }else{
            res.json({message:"Patologia no encontrado"}).status(404)
        }
    }

    static updatePatologia=async(req,res)=>{
        let id=req.params.id
        const patologia=await PatologiaModel.updatePatologia(id,req.body)
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

    static disable = async (req, res) => {
        const {id}=req.params
        const result = await PatologiaModel.disable(id);
        if (!result ?.err) {
          res.json(result );
        } else {
          res.json({ message: "No se pudo inhabilitar la Patologia" }).status(404);
        }
      };

}