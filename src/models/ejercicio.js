import { PrismaClient } from "@prisma/client";

const prisma =new PrismaClient()
export class EjercicioModel{

    static getAll=async()=>{
        try {
            const ejercicio=await prisma.ejercicio.findMany()
            /* console.log(data)
            const ejercicios=await data.json()
            NO ES NECESARIO CONVERTIR A JSON
             */return ejercicio  
        } catch (error) {
            return {
                err:error
            }
        }

        
    }

    static getEjerciciobyId=async(id)=>{
        try {
            id=+id
            const ejercicio=await prisma.ejercicio.findFirst({
                where:{
                    id:id
                }
            }) 
            return ejercicio    
        } catch (error) {
            return {
                err:error
            }
        }

        
    }

    static updateEjercicio=async(id,ejercicioUpdated)=>{
        try {
            const ejercicio=await prisma.ejercicio.update({
                where:{
                    id:+id
                },
                data:ejercicioUpdated
            }) 
            return ejercicio    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

    static addEjercicio=async(dataEjercicio)=>{
        try {
            const newEjercicio=await prisma.ejercicio.create({
                data:dataEjercicio
            })
            
            return newEjercicio    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

}