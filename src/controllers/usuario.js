import { UsuarioModel } from "../models/usuario.js";

export class UsuarioController {
  static getAll = async (req, res) => {
    console.log("usuario router");

    const usuarios = await UsuarioModel.getAll();
    console.log("resultado de usuarios del controller: ", usuarios);
    if (!usuarios?.err) {
      res.json(usuarios);
    } else {
      res
        .json({
          message: "No se pudo traer los Usuarios",
          error: usuarios?.err,
        })
        .status(404);
    }
  };
  static getRolByUser = async (req, res) => {
    console.log("usuario router");
    const { user } = req.params;
    const usuarios = await UsuarioModel.getRolByUser(user);
    console.log("resultado de usuarios del controller: ", usuarios);
    if (!usuarios?.err) {
      res.json(usuarios);
    } else {
      res
        .json({
          message: "No se pudo traer los Usuarios",
          error: usuarios?.err,
        })
        .status(404);
    }
  };

  static getAllRoles = async (req, res) => {
    console.log("usuario router");
    const roles = await UsuarioModel.getAllRoles();
    console.log("resultado de usuarios del controller: ");
    if (!roles?.err) {
      res.json(roles);
    } else {
      res
        .json({ message: "No se pudo traer los Usuarios", error: roles?.err })
        .status(404);
    }
  };

  static getAllRolesToEdit = async (req, res) => {
    console.log("usuario router");
    const { idRol } = req.params;
    const roles = await UsuarioModel.getAllRolesToEdit(idRol);
    console.log("resultado de usuarios del controller: ");
    if (!roles?.err) {
      res.json(roles);
    } else {
      res
        .json({ message: "No se pudo traer los roles", error: roles?.err })
        .status(404);
    }
  };

  static getUsuariobyId = async (req, res) => {
    let id = req.params.id;
    const usuario = await UsuarioModel.getUsuariobyId(id);
    if (!usuario?.err) {
      res.json(usuario);
    } else {
      res.json({ message: "Usuario no encontrado" }).status(404);
    }
  };

  static updateUsuario = async (req, res) => {
    let id = req.params.id;
    const usuario = await UsuarioModel.updateUsuario(id, req.body);
    console.log(usuario)
    if (!usuario?.err) {
      res.json(usuario);
    } else {
      res.json({ message: "Usuario no encontrado" }).status(404);
    }
  };

  static blanquearUsuario = async (req, res) => {
    let id = req.params.id;
    const usuario = await UsuarioModel.blanquearUsuario(id);
    console.log("CONTROLLER blanquearUsuario: ",usuario)
    if (!usuario?.err) {
      res.json(usuario);
    } else {
      res.json({ err:{message: "Error al blanquear al usuario"} }).status(404);
    }
  };

  static updatePassword = async (req, res) => {
    let id = req.params.id;
    let { newPassword } = req.body; // Obtener la nueva contraseña del cuerpo de la solicitud

    if (!newPassword) {
      return res.status(400).json({ message: "Nueva contraseña es requerida" });
    }

    const usuario = await UsuarioModel.updatePassword(id, newPassword);
    if (!usuario?.err) {
      res.json(usuario);
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  };

  static addUsuario = async (req, res) => {
    const newUsuario = await UsuarioModel.addUsuario(req.body);
    console.log(newUsuario)
    if (!newUsuario?.err) {
      res.json(newUsuario);
    } else {
      res.json({ err:{message: "Error al crear al usuario"} }).status(404);
    }
  };

  static getJwtToken = async (req, res) => {
    const { usuario, password } = req.body;
    console.log("controller jwt");
    const jwtToken = await UsuarioModel.getJwtToken(usuario, password);
    if (!jwtToken?.err) {
      console.log("resultado de jwt token:", jwtToken);
      res.json(jwtToken);
    } else {
      res.json({ error: "No se pudo obtener el jwt token" }).status(404);
    }
  };

  static disable = async (req, res) => {
    const {id}=req.params
    const result = await UsuarioModel.disable(id);
    console.log(result)
    if (!result ?.err) {
      res.json(result );
    } else {
      res.json({ message: "No se pudo inhabilitar el Usuario" }).status(404);
    }
  };
  static getPatologiaToUsuarioEdit = async (req, res) => {
    let id = req.params.id;
    const patologias = await UsuarioModel.getPatologiaToUsuarioEdit(id);
    if (!patologias?.err) {
      res.json(patologias);
    } else {
      res.json({ message: "Patologias no encontradas" }).status(404);
    }
  };


}
