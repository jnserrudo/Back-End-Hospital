import { PrismaClient } from "@prisma/client";

const prisma =new PrismaClient()

export class ConsultaModel{
    static getAll=async()=>{
        const consultas=await prisma.consulta.findMany()
        return consultas??null
    }

    static getConsultaByDni=async(dni)=>{
        dni=+dni
        const consulta=await prisma.consulta.findMany({
            where:{
                pacienteDni:dni
            }
        }) 
        return consulta
    }

    static getConsultaById=async(id)=>{
        id=+id
        const consulta=await prisma.consulta.findFirst({
            where:{
                id:id
            }
        }) 
        return consulta
    }

    static updateConsulta=async(dni,consultaUpdated)=>{
        const consulta=await prisma.consulta.update({
            where:{
                dni:+dni
            },
            data:consultaUpdated
        }) 
        return consulta
    }

    static addConsulta=async(dataConsulta)=>{
        const newConsulta=await prisma.consulta.create({
            data:dataConsulta
        })
        
        return newConsulta
    }
}