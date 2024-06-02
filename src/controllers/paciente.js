import { PacienteModel } from "../models/paciente.js"

export class PacienteController{
    static getAll=async(req,res)=>{
        const pacientes=await PacienteModel.getAll()
        res.json(pacientes)
    }

    static getPacientebyDni=async(req,res)=>{
        let dni=req.params.dni
        const paciente=await PacienteModel.getPacientebyDni(dni)
        if(!paciente){
            res.json({message:"Paciente no encontrado"}).status(404)
        }else{
            res.json(paciente)
        }
    }

    static updatePaciente=async(req,res)=>{
        let dni=req.params.dni
        const paciente=await PacienteModel.updatePaciente(dni,req.body)
        if(!paciente){
            res.json({message:"Paciente no encontrado"}).status(404)
        }else{
            res.json(paciente)
        }
    }

    static addPaciente=async(req,res)=>{
        const newPaciente=await PacienteModel.addPaciente(req.body)
        res.json(newPaciente)
    }
}