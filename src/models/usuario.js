import { PrismaClient } from "@prisma/client";

const prisma =new PrismaClient()
export class UsuarioModel{

    static getAll=async()=>{
        try {
            console.log("model usuario")
            const usuarios=await prisma.usuario.findMany()
        /* console.log(data)
        const usuarios=await data.json()
        NO ES NECESARIO CONVERTIR A JSON
         */return usuarios
        } catch (error) {
            return {
                err:error
            }
        }

        
    }

    static getUsuariobyId=async(id)=>{
        try {
            id=+id
            const usuario=await prisma.usuario.findFirst({
                where:{
                    id:id
                }
            }) 
            return usuario    
        } catch (error) {
            return {
                err:error
            }
        }

        
    }

    static updateUsuario=async(id,usuarioUpdated)=>{
        try {
        
            const usuario=await prisma.usuario.update({
                where:{
                    id:+id
                },
                data:usuarioUpdated
            }) 
            return usuario
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

    static addUsuario=async(dataUsuario)=>{
        try {
            const newUsuario=await prisma.usuario.create({
                data:dataUsuario
            })
            
            return newUsuario    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

}