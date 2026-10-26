import express from "express";
import { UsuarioController } from "../controllers/usuario.js";
import { requireAuth, requireRole, ROLES, STAFF } from "../middlewares/auth.js";
import { limiteIntentos, limitePedidos } from "../middlewares/seguridad.js";
import { RecuperacionController } from "../controllers/recuperacion.js";

export const usuarioRouter = express.Router();
const admin = requireRole(ROLES.ADMIN);

// Público: inicio de sesión (con límite de intentos fallidos).
usuarioRouter.post("/jwtToken", limiteIntentos(), UsuarioController.getJwtToken);

// Cambio de la propia contraseña: acepta también el token del cambio obligatorio.
usuarioRouter.put(
  "/password/:id",
  requireAuth({ allowScopes: ["session", "password-change"] }),
  // Evita adivinar la contraseña actual probando muchas veces.
  limiteIntentos({ clave: (req) => `pwd:${req.params.id}` }),
  UsuarioController.updatePassword
);

// Público: «¿Olvidaste tu contraseña?» (pedir enlace, revisarlo y crear la contraseña nueva).
usuarioRouter.post(
  "/recuperar",
  limitePedidos({ maxIp: 10, maxClave: 3, clave: (req) => req.body?.identificador }),
  RecuperacionController.solicitar
);
usuarioRouter.get("/restablecer/verificar", limitePedidos({ maxIp: 30 }), RecuperacionController.verificar);
usuarioRouter.post(
  "/restablecer",
  limitePedidos({ maxIp: 15, maxClave: 8, clave: (req) => String(req.body?.token || "").slice(0, 16) }),
  RecuperacionController.restablecer
);

// Todo lo demás requiere sesión.
usuarioRouter.use(requireAuth());

usuarioRouter.post("/token/renovar", UsuarioController.renovarToken);
usuarioRouter.get("/me", UsuarioController.getMe);
usuarioRouter.get("/profesionales/lista", UsuarioController.getProfesionales);
usuarioRouter.get("/rol/:user", UsuarioController.getRolByUser);

usuarioRouter.get("/", admin, UsuarioController.getAll);
usuarioRouter.get("/rol", admin, UsuarioController.getAllRoles);
usuarioRouter.get("/rol/edit/:idRol", admin, UsuarioController.getAllRolesToEdit);
usuarioRouter.get("/patologia/edit/:id", requireRole(...STAFF), UsuarioController.getPatologiaToUsuarioEdit);
usuarioRouter.get("/:id", UsuarioController.getUsuariobyId); // admin o la propia cuenta (se valida en el controlador)
usuarioRouter.post("/", admin, UsuarioController.addUsuario);
usuarioRouter.put("/blanquear/:id", admin, UsuarioController.blanquearUsuario);
usuarioRouter.put("/inhabilitar/:id", admin, UsuarioController.disable);
usuarioRouter.put("/habilitar/:id", admin, UsuarioController.enable);
usuarioRouter.put("/:id", admin, UsuarioController.updateUsuario);
