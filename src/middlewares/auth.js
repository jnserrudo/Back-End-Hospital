import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ROLES = { ADMIN: 1, PROFESIONAL: 2, PACIENTE: 3 };
export const STAFF = [ROLES.ADMIN, ROLES.PROFESIONAL];

export const SESSION_TTL = process.env.JWT_EXPIRES_IN || "2h";
const PASSWORD_CHANGE_TTL = "15m";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // app.js ya valida al arrancar; esto es una red de seguridad.
    throw new Error("JWT_SECRET no está configurado");
  }
  return secret;
};

export const signSessionToken = (usuario) =>
  jwt.sign(
    { sub: usuario.id, usuario: usuario.usuario, rol: usuario.idRol, scope: "session" },
    getSecret(),
    { expiresIn: SESSION_TTL }
  );

// Token de alcance limitado: solo sirve para el cambio obligatorio de contraseña.
export const signPasswordChangeToken = (usuario) =>
  jwt.sign(
    { sub: usuario.id, usuario: usuario.usuario, rol: usuario.idRol, scope: "password-change" },
    getSecret(),
    { expiresIn: PASSWORD_CHANGE_TTL }
  );

const deny = (res, status, code, message) =>
  res.status(status).json({ message, err: { message }, code });

/**
 * Verifica el JWT y que la cuenta siga habilitada.
 * Carga en req.user { id, usuario, rol, nombre, apellido, pacienteId }.
 * @param {object} opts { allowScopes: ["session"] }
 */
export const requireAuth = (opts = {}) => {
  const allowScopes = opts.allowScopes || ["session"];
  return async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return deny(res, 401, "SESION_REQUERIDA", "Tu sesión terminó o no iniciaste sesión. Ingresá de nuevo para continuar.");
    }
    let payload;
    try {
      payload = jwt.verify(token, getSecret());
    } catch (error) {
      const expired = error?.name === "TokenExpiredError";
      return deny(
        res,
        401,
        expired ? "SESION_VENCIDA" : "SESION_INVALIDA",
        expired
          ? "Tu sesión venció. Ingresá de nuevo para continuar."
          : "No pudimos verificar tu sesión. Ingresá de nuevo para continuar."
      );
    }
    const scope = payload.scope || "session";
    if (!allowScopes.includes(scope)) {
      return deny(res, 401, "SESION_INVALIDA", "Antes de continuar tenés que cambiar tu contraseña. Ingresá de nuevo.");
    }
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: +payload.sub },
        select: {
          id: true, usuario: true, nombre: true, apellido: true, idRol: true, habilitado: true, blanqueado: true, passwordChangedAt: true,
          paciente: { select: { id: true, habilitado: true } },
        },
      });
      if (!usuario) {
        return deny(res, 401, "SESION_INVALIDA", "Tu cuenta ya no existe. Comunicate con el hospital.");
      }
      const pacienteDeshabilitado = usuario.idRol === ROLES.PACIENTE && usuario.paciente && usuario.paciente.habilitado !== 1;
      if (usuario.habilitado !== 1 || pacienteDeshabilitado) {
        return deny(res, 403, "CUENTA_DESHABILITADA", "Tu cuenta está deshabilitada. Comunicate con el hospital para volver a habilitarla.");
      }
      // Si la contraseña se restableció por email, las sesiones abiertas antes dejan de valer.
      if (usuario.passwordChangedAt && payload.iat && payload.iat < Math.floor(usuario.passwordChangedAt.getTime() / 1000)) {
        return deny(res, 401, "SESION_VENCIDA", "Tu contraseña se cambió hace poco. Ingresá de nuevo con la contraseña nueva.");
      }
      if (scope === "session" && usuario.blanqueado === 0) {
        return deny(res, 401, "CAMBIO_PASSWORD_REQUERIDO", "Antes de continuar tenés que cambiar tu contraseña. Ingresá de nuevo.");
      }
      req.user = {
        id: usuario.id,
        usuario: usuario.usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.idRol,
        pacienteId: usuario.paciente?.id ?? null,
        scope,
      };
      next();
    } catch (error) {
      console.error("[auth] Error verificando la sesión:", error);
      return deny(res, 500, "ERROR_SESION", "No pudimos verificar tu sesión. Intentá de nuevo en unos minutos.");
    }
  };
};

const ROLE_NAMES = { 1: "administradores", 2: "profesionales de salud", 3: "pacientes" };

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return deny(res, 401, "SESION_REQUERIDA", "Tu sesión terminó. Ingresá de nuevo para continuar.");
  }
  if (!roles.includes(req.user.rol)) {
    const quienes = roles.map((r) => ROLE_NAMES[r]).filter(Boolean).join(" o ");
    return deny(res, 403, "SIN_PERMISO", `No tenés permiso para hacer esto. Solo pueden hacerlo ${quienes}.`);
  }
  next();
};

// Aplica requireRole solo a métodos que modifican datos (POST/PUT/PATCH/DELETE),
// salvo las rutas de lectura indicadas (ej. POST /filtro).
export const writeRoles = (roles, { readOnlyPosts = [] } = {}) => (req, res, next) => {
  const isRead = req.method === "GET" || (req.method === "POST" && readOnlyPosts.includes(req.path));
  if (isRead) return next();
  return requireRole(...roles)(req, res, next);
};
