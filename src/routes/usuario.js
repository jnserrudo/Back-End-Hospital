import express from "express";
import { UsuarioController } from "../controllers/usuario.js";

export const usuarioRouter=express.Router()

usuarioRouter.get('/', UsuarioController.getAll)

usuarioRouter.get('/rol/:user', UsuarioController.getRolByUser)

usuarioRouter.get('/rol', UsuarioController.getAllRoles)

usuarioRouter.get('/rol/edit/:idRol', UsuarioController.getAllRolesToEdit)




usuarioRouter.get('/:id', UsuarioController.getUsuariobyId)

usuarioRouter.put('/:id', UsuarioController.updateUsuario)


usuarioRouter.put('/blanquear/:id', UsuarioController.blanquearUsuario)

usuarioRouter.put('/inhabilitar/:id', UsuarioController.disable)

usuarioRouter.put('/password/:id', UsuarioController.updatePassword)


usuarioRouter.post('/',UsuarioController.addUsuario)

usuarioRouter.get('/patologia/edit/:id', UsuarioController.getPatologiaToUsuarioEdit)

usuarioRouter.post('/jwtToken',UsuarioController.getJwtToken)

