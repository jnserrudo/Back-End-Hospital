// Encabezados de seguridad básicos (sin dependencias nuevas).
// No usamos Content-Security-Policy estricta porque la app embebe videos de YouTube y
// archivos externos; se puede sumar cuando haya dominio definitivo.
export const encabezadosSeguridad = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=15552000");
  }
  next();
};

/**
 * Límite de intentos fallidos (en memoria). Cuenta solo los errores de credenciales
 * (usuario/contraseña o contraseña actual incorrecta); un intento correcto limpia el contador.
 *   - 5 fallos seguidos para el mismo usuario desde la misma conexión → espera 15 min
 *   - 30 fallos desde la misma conexión (cualquier usuario) → espera 15 min
 */
export const limiteIntentos = ({
  max = 5,
  maxIp = 30,
  ventanaMin = 15,
  clave = (req) => req.body?.usuario,
  // Qué cuenta como intento fallido (por defecto: usuario o contraseña incorrectos).
  esFallo = (status, body) => status === 401 || body?.code === "CREDENCIALES_INVALIDAS" || body?.code === "PASSWORD_ACTUAL_INCORRECTA",
} = {}) => {
  const ventana = ventanaMin * 60 * 1000;
  const registros = new Map(); // key -> { fallos, desde, bloqueadoHasta }

  const limpiar = () => {
    const ahora = Date.now();
    for (const [k, r] of registros) if (r.desde + ventana < ahora && (r.bloqueadoHasta || 0) < ahora) registros.delete(k);
  };
  setInterval(limpiar, 5 * 60 * 1000).unref();

  const sumarFallo = (k, limite) => {
    const ahora = Date.now();
    let r = registros.get(k);
    if (!r || r.desde + ventana < ahora) r = { fallos: 0, desde: ahora, bloqueadoHasta: 0 };
    r.fallos += 1;
    if (r.fallos >= limite) r.bloqueadoHasta = ahora + ventana;
    registros.set(k, r);
  };

  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || "desconocida";
    const usuario = String(clave(req) ?? "").trim().toLowerCase();
    const kUser = `u:${ip}:${usuario}`;
    const kIp = `ip:${ip}`;
    const ahora = Date.now();
    const bloqueo = Math.max(registros.get(kUser)?.bloqueadoHasta || 0, registros.get(kIp)?.bloqueadoHasta || 0);
    if (bloqueo > ahora) {
      const min = Math.max(1, Math.ceil((bloqueo - ahora) / 60000));
      const message = `Hubo demasiados intentos fallidos. Por seguridad, esperá ${min} ${min === 1 ? "minuto" : "minutos"} y volvé a intentar. Si no recordás tu contraseña, pedile al administrador del hospital que la restablezca.`;
      res.setHeader("Retry-After", String(min * 60));
      return res.status(429).json({ message, err: { message }, code: "DEMASIADOS_INTENTOS" });
    }
    let cuerpo = null;
    const json = res.json.bind(res);
    res.json = (b) => {
      cuerpo = b;
      return json(b);
    };
    res.on("finish", () => {
      if (esFallo(res.statusCode, cuerpo)) {
        sumarFallo(kUser, max);
        sumarFallo(kIp, maxIp);
      } else if (res.statusCode < 300) {
        registros.delete(kUser);
      }
    });
    next();
  };
};

// Evita guardar direcciones de archivos que solo existen en la compu de quien carga
// (por ejemplo «blob:», que es una vista previa temporal del navegador) o que no son seguras.
const CAMPOS_MEDIA = ["urlVideo", "urlFoto", "urlArchivo", "urlExterna", "urlImagen"];
const URL_NO_VALIDA = /(^|["'\s=(])(blob|data|javascript|file|vbscript):/i;

export const validarUrlsMedia = (req, res, next) => {
  if (!["POST", "PUT", "PATCH"].includes(req.method) || !req.body || typeof req.body !== "object") return next();
  // urlFoto (recetas) es VARCHAR(191) en la base: una dirección más larga hacía fallar el guardado con un error genérico.
  if (typeof req.body.urlFoto === "string" && req.body.urlFoto.trim().length > 191) {
    const message = "El enlace de la foto es demasiado largo (máximo 191 caracteres). Subí la imagen desde el botón o usá un enlace más corto.";
    return res.status(400).json({ message, err: { message }, code: "URL_LARGA", campo: "urlFoto" });
  }
  const campo = CAMPOS_MEDIA.find((c) => typeof req.body[c] === "string" && URL_NO_VALIDA.test(req.body[c].trim()));
  if (!campo) return next();
  const local = /blob:/i.test(req.body[campo]);
  const message = local
    ? "El archivo no se terminó de subir: la dirección que quedó es una vista previa que solo existe en tu navegador. Volvé a elegir el archivo (o pegá un enlace de YouTube) y guardá de nuevo."
    : "La dirección del archivo no es válida. Subí el archivo desde el botón o pegá un enlace que empiece con https://.";
  return res.status(400).json({ message, err: { message }, code: "URL_NO_VALIDA", campo });
};

/**
 * Límite de pedidos (en memoria): cuenta TODOS los pedidos, no solo los fallidos.
 * Se usa en «¿Olvidaste tu contraseña?» para que nadie pueda llenar de emails una cuenta
 * ni probar datos en masa. Por conexión y por dato ingresado (usuario/email/DNI).
 */
export const limitePedidos = ({ maxIp = 10, maxClave = 3, ventanaMin = 15, clave = () => "", mensaje } = {}) => {
  const ventana = ventanaMin * 60 * 1000;
  const registros = new Map();
  setInterval(() => {
    const ahora = Date.now();
    for (const [k, r] of registros) if (r.desde + ventana < ahora) registros.delete(k);
  }, 5 * 60 * 1000).unref();
  const contar = (k, limite) => {
    const ahora = Date.now();
    let r = registros.get(k);
    if (!r || r.desde + ventana < ahora) r = { n: 0, desde: ahora };
    r.n += 1;
    registros.set(k, r);
    return r.n > limite ? Math.ceil((r.desde + ventana - ahora) / 60000) : 0;
  };
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || "desconocida";
    const c = String(clave(req) ?? "").trim().toLowerCase();
    const espera = Math.max(contar(`ip:${ip}`, maxIp), c ? contar(`c:${c}`, maxClave) : 0);
    if (espera > 0) {
      const min = Math.max(1, espera);
      const message = mensaje
        ? mensaje(min)
        : `Hiciste muchos pedidos seguidos. Por seguridad, esperá ${min} ${min === 1 ? "minuto" : "minutos"} y volvé a intentar.`;
      res.setHeader("Retry-After", String(min * 60));
      return res.status(429).json({ message, err: { message }, code: "DEMASIADOS_PEDIDOS" });
    }
    next();
  };
};
