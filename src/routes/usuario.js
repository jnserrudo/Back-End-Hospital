import express from "express";
import { UsuarioController } from "../controllers/usuario.js";

export const usuarioRouter=express.Router()
usuarioRouter.get('/', UsuarioController.getAll)
usuarioRouter.get('/rol/:user', UsuarioController.getRolByUser)

usuarioRouter.get('/:id', UsuarioController.getUsuariobyId)

usuarioRouter.put('/:id', UsuarioController.updateUsuario)

usuarioRouter.post('/',UsuarioController.addUsuario)
usuarioRouter.post('/jwtToken',UsuarioController.getJwtToken)

