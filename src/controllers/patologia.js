import { sendError } from "../utils/http.js";
import { PatologiaModel } from "../models/patologia.js"

export class PatologiaController{
    static getAll=async(req,res)=>{
        const patologias=await PatologiaModel.getAll()
        if (!patologias?.err) {
            res.json(patologias)
        } else {
      sendError(res, patologias.err, "No pudimos cargar las patologías");}
    }

    static getPatologiabyId=async(req,res)=>{
        let id=req.params.id
        const patologia=await PatologiaModel.getPatologiabyId(id)
        if (!patologia?.err) {
            res.json(patologia)
        } else {
      sendError(res, patologia.err, "No pudimos cargar la lista de patologías");}
    }

    static updatePatologia=async(req,res)=>{
        let id=req.params.id
        const patologia=await PatologiaModel.updatePatologia(id,req.body)
        if (!patologia?.err) {
            res.json(patologia)
        } else {
      sendError(res, patologia.err, "No pudimos guardar los cambios de la patología");}
    }

    static addPatologia=async(req,res)=>{
        const newPatologia=await PatologiaModel.addPatologia(req.body)
        if (!newPatologia?.err) {
            res.json(newPatologia)
        } else {
      sendError(res, newPatologia.err, "No pudimos guardar la patología");}
    }

    static disable = async (req, res) => {
        const {id}=req.params
        const result = await PatologiaModel.disable(id);
        if (!result?.err) {
          res.json(result );
        } else {
      sendError(res, result.err, "No pudimos deshabilitar la patología");
        }
      };

}