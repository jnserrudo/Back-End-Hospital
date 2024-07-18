import { PacienteModel } from "../models/paciente.js"

export class PacienteController{
    static getAll=async(req,res)=>{
        const pacientes=await PacienteModel.getAll()
        if(!pacientes?.err){
            res.json(pacientes)
        }else{
            res.json({message:"Pacientes no encontrados"}).status(404)
        }
    }

    static getPacientebyDni=async(req,res)=>{
        let dni=req.params.dni
        const paciente=await PacienteModel.getPacientebyDni(dni)
        if(!paciente?.err){
            res.json(paciente)
        }else{
            res.json({message:"Paciente no encontrado"}).status(404)
        }
    }

    static updatePaciente=async(req,res)=>{
        let dni=req.params.dni
        const paciente=await PacienteModel.updatePaciente(dni,req.body)
        if(!paciente?.err){
            res.json(paciente)
        }else{
            res.json({message:"Paciente no encontrado"}).status(404)
        }
    }

    static addPaciente=async(req,res)=>{
        const newPaciente=await PacienteModel.addPaciente(req.body)
        if(!newPaciente?.err){
            res.json(newPaciente)
        }else{
            res.json({message:"Paciente no encontrado"}).status(404)
        }
    }

    static disable = async (req, res) => {
        const {id}=req.params
        const result = await PacienteModel.disable(id);
        if (!result ?.err) {
          res.json(result );
        } else {
          res.json({ message: "No se pudo inhabilitar el Paciente" }).status(404);
        }
      };
}