import { UsuarioModel } from "../models/usuario.js"

export class UsuarioController{
    static getAll=async(req,res)=>{
        console.log('usuario router')

        const usuarios=await UsuarioModel.getAll()
        if(!usuarios?.err){
            res.json(usuarios)
        }else{
            res.json({message:"No se pudo traer los Usuarios"}).status(404)

        }
    }

    static getUsuariobyId=async(req,res)=>{
        let id=req.params.id
        const usuario=await UsuarioModel.getUsuariobyId(id)
        if(!usuario?.err){
            res.json(usuario)
        }else{
            res.json({message:"Usuario no encontrado"}).status(404)
        }
    }

    static updateUsuario=async(req,res)=>{
        let id=req.params.id
        const usuario=await UsuarioModel.updateUsuario(id,req.body)
        if(!usuario?.err){
            res.json(usuario)
        }else{
            res.json({message:"Usuario no encontrado"}).status(404)
        }
    }

    static addUsuario=async(req,res)=>{
        const newUsuario=await UsuarioModel.addUsuario(req.body)
        if(!newUsuario?.err){
            res.json(newUsuario)
        }else{
            res.json({message:"No se pudo insertar el Usuario"}).status(404)

        }
    }
}