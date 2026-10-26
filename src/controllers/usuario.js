import { UsuarioModel } from "../models/usuario.js";
import { handle, AppError } from "../utils/http.js";
import { ROLES } from "../middlewares/auth.js";

export class UsuarioController {
  static getAll = handle("No pudimos cargar la lista de usuarios", async (req, res) => {
    res.json(await UsuarioModel.getAll());
  });

  // Solo el propio usuario (o un administrador) puede consultar el rol de una cuenta.
  static getRolByUser = handle("No pudimos cargar tu rol", async (req, res) => {
    const { user } = req.params;
    if (req.user.rol !== ROLES.ADMIN && req.user.usuario !== user) {
      throw new AppError(403, "No tenés permiso para consultar los datos de otra cuenta.", "SIN_PERMISO");
    }
    res.json(req.user.usuario === user ? req.user.rol : await UsuarioModel.getRolByUser(user));
  });

  static getAllRoles = handle("No pudimos cargar la lista de roles", async (req, res) => {
    res.json(await UsuarioModel.getAllRoles());
  });

  static getAllRolesToEdit = handle("No pudimos cargar la lista de roles", async (req, res) => {
    res.json(await UsuarioModel.getAllRolesToEdit(req.params.idRol));
  });

  static getUsuariobyId = handle("No pudimos cargar los datos de la cuenta", async (req, res) => {
    const id = +req.params.id;
    if (req.user.rol !== ROLES.ADMIN && req.user.id !== id) {
      throw new AppError(403, "No tenés permiso para ver los datos de otra cuenta.", "SIN_PERMISO");
    }
    res.json(await UsuarioModel.getUsuariobyId(id));
  });

  static getMe = handle("No pudimos cargar tus datos", async (req, res) => {
    res.json(await UsuarioModel.getUsuariobyId(req.user.id));
  });

  static updateUsuario = handle("No pudimos guardar los cambios de la cuenta", async (req, res) => {
    res.json(await UsuarioModel.updateUsuario(req.params.id, req.body, req.user));
  });

  static blanquearUsuario = handle("No pudimos restablecer la contraseña", async (req, res) => {
    res.json(await UsuarioModel.blanquearUsuario(req.params.id));
  });

  // Cambiar la PROPIA contraseña. El id de la URL debe coincidir con el de la sesión.
  static updatePassword = handle("No pudimos cambiar la contraseña", async (req, res) => {
    if (+req.params.id !== req.user.id) {
      throw new AppError(403, "Solo podés cambiar tu propia contraseña. Para otra cuenta usá «Restablecer contraseña».", "SIN_PERMISO");
    }
    res.json(await UsuarioModel.cambiarPasswordPropia(req.user.id, req.body || {}, req.user.scope));
  });

  static addUsuario = handle("No pudimos crear la cuenta", async (req, res) => {
    res.status(201).json(await UsuarioModel.addUsuario(req.body || {}));
  });

  static getJwtToken = handle("No pudimos iniciar sesión", async (req, res) => {
    const { usuario, password } = req.body || {};
    res.json(await UsuarioModel.login(usuario, password));
  });

  static renovarToken = handle("No pudimos renovar tu sesión", async (req, res) => {
    res.json(await UsuarioModel.renovarToken(req.user.id));
  });

  static disable = handle("No pudimos deshabilitar la cuenta", async (req, res) => {
    res.json(await UsuarioModel.setHabilitado(req.params.id, false, req.user));
  });

  static enable = handle("No pudimos habilitar la cuenta", async (req, res) => {
    res.json(await UsuarioModel.setHabilitado(req.params.id, true, req.user));
  });

  static getPatologiaToUsuarioEdit = handle("No pudimos cargar las patologías", async (req, res) => {
    res.json(await UsuarioModel.getPatologiaToUsuarioEdit(req.params.id));
  });

  static getProfesionales = handle("No pudimos cargar la lista de profesionales", async (req, res) => {
    res.json(await UsuarioModel.getProfesionales());
  });
}
