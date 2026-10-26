// Respuestas de error uniformes y aptas para mostrar al usuario.
// El detalle técnico se registra solo en el log del servidor; al cliente
// le llega un mensaje en castellano claro, sin códigos ni trazas.

export class AppError extends Error {
  constructor(status, userMessage, code) {
    super(userMessage);
    this.status = status;
    this.userMessage = userMessage;
    this.code = code;
  }
}

const describePrismaError = (err) => {
  const code = err?.code;
  if (code === "P2025")
    return { status: 404, detail: "no encontramos el registro. Puede que lo hayan deshabilitado o eliminado. Actualizá la página." };
  if (code === "P2002")
    return { status: 409, detail: "ya existe un registro con esos datos." };
  if (code === "P2003")
    return { status: 409, detail: "uno de los datos elegidos ya no existe. Actualizá la página y volvé a intentar." };
  if (err?.name === "PrismaClientValidationError")
    return { status: 400, detail: "faltan datos o alguno tiene un formato incorrecto. Revisá el formulario." };
  return null;
};

/**
 * Envía un error al cliente.
 * @param res      respuesta de Express
 * @param err      error original (Error, objeto de Prisma, string o {err})
 * @param fallback mensaje de contexto, ej. "No pudimos guardar la receta"
 */
export const sendError = (res, err, fallback = "No pudimos completar la operación") => {
  const original = err?.err ?? err;
  if (original instanceof AppError || original?.userMessage) {
    return res.status(original.status || 400).json({
      message: original.userMessage,
      err: { message: original.userMessage },
      code: original.code,
    });
  }
  console.error(`[API] ${fallback}:`, original?.stack || original?.message || original);
  const prisma = describePrismaError(original);
  const base = fallback.replace(/[.\s]+$/, "");
  const message = prisma
    ? `${base}: ${prisma.detail}`
    : `${base}. Intentá de nuevo en unos minutos; si el problema sigue, avisá al administrador.`;
  const status = prisma?.status || 500;
  return res.status(status).json({ message, err: { message } });
};

// Envuelve controladores async para que cualquier excepción termine en sendError.
export const handle = (fallback, fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    sendError(res, error, fallback);
  }
};
