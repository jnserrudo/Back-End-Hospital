import { PrismaClient } from "@prisma/client";

const prisma =new PrismaClient()
export class InformacionModel{

    static getAll=async()=>{
        try {
            const informacion=await prisma.informacion.findMany()
            /* console.log(data)
            const informacions=await data.json()
            NO ES NECESARIO CONVERTIR A JSON
             */return informacion  
        } catch (error) {
            return {
                err:error
            }
        }

        
    }

    static getInformacionbyId=async(id)=>{
        try {
            id=+id
            const informacion=await prisma.informacion.findFirst({
                where:{
                    id:id
                }
            }) 
            return informacion    
        } catch (error) {
            return {
                err:error
            }
        }

        
    }

    static updateInformacion=async(dni,informacionUpdated)=>{
        try {
            const informacion=await prisma.informacion.update({
                where:{
                    dni:+dni
                },
                data:informacionUpdated
            }) 
            return informacion    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

    static addInformacion=async(dataInformacion)=>{
        try {
            const newInformacion=await prisma.informacion.create({
                data:dataInformacion
            })
            
            return newInformacion    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

}