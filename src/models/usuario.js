import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken'
const prisma =new PrismaClient()
export class UsuarioModel{

    static getAll=async()=>{
        try {
            console.log("model usuario")
            const usuarios=await prisma.usuario.findMany()
            console.log("resultado de usuario en el modelo: ", usuarios)
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
    
    static getRolByUser=async(user)=>{
        try {
            console.log("model usuario")
            const rol=await prisma.usuario.findFirst({
                where:{
                    nombre:user
                }
            })
            
            return rol.idRol
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
    static getJwtToken=async(user,password)=>{
        try {

            let usuarioValidated=await this.validateUsuario(user,password)
            if(usuarioValidated){
                //usuario validado, devolver token
                let token=jwt.sign({user},'ozuna',{
                    expiresIn:'30m'
                })

                return token

            }else{
                //usuario no validado
                return {
                    err:'Usuario no valido'
                }
            }
            
        } catch (error) {
            return {
                err:error
            }
        }
    }

    static validateUsuario=async()=>{
        try {
            const result=await prisma.usuario.findFirst({
                where:{
                    nombre:user,
                    password:password
                }
            })

            if(result?.length>0){
                return true
            }else{
                return false
            }
            

        } catch (error) {
            return {
                err:error
            }
        }
    }

}