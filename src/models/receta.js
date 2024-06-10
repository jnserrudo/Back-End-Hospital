import { PrismaClient } from "@prisma/client";

const prisma =new PrismaClient()
export class RecetaModel{

    static getAll=async()=>{
        try {
            const recetas=await prisma.receta.findMany()
            /* console.log(data)
            const recetas=await data.json()
            NO ES NECESARIO CONVERTIR A JSON
             */return recetas    
        } catch (error) {
            return {
                err:error
            }
        }

        
    }

    static getRecetabyId=async(id)=>{
        try {
            id=+id
            const receta=await prisma.receta.findFirst({
                where:{
                    id:id
                }
            }) 
            return receta    
        } catch (error) {
            return {
                err:error
            }
        }

        
    }

    static updateReceta=async(dni,recetaUpdated)=>{
        try {
            const receta=await prisma.receta.update({
                where:{
                    dni:+dni
                },
                data:recetaUpdated
            }) 
            return receta    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

    static addReceta=async(dataReceta)=>{
        try {
            const newReceta=await prisma.receta.create({
                data:dataReceta
            })
            
            return newReceta    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

}