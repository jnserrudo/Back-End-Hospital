import { PrismaClient } from "@prisma/client";

const prisma =new PrismaClient()
export class PacienteModel{

    static getAll=async()=>{
        const pacientes=await prisma.paciente.findMany()
        /* console.log(data)
        const pacientes=await data.json()
        NO ES NECESARIO CONVERTIR A JSON
         */return pacientes
    }

    static getPacientebyDni=async(dni)=>{
        dni=+dni
        const paciente=await prisma.paciente.findFirst({
            where:{
                dni:dni
            }
        }) 
        return paciente
    }

    static updatePaciente=async(dni,pacienteUpdated)=>{
        const paciente=await prisma.paciente.update({
            where:{
                dni:+dni
            },
            data:pacienteUpdated
        }) 
        return paciente
    }

    static addPaciente=async(dataPaciente)=>{
        const newPaciente=await prisma.paciente.create({
            data:dataPaciente
        })
        
        return newPaciente
    }

}