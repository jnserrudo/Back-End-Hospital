import multer from "multer";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

// Carpeta única de archivos subidos (servida como /uploads en app.js).
const UPLOADS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../uploads");

const TIPOS = {
  imagen: { ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"], mime: /^image\//, texto: "imágenes JPG, PNG, WEBP o GIF" },
  video: { ext: [".mp4", ".webm", ".mov", ".m4v", ".ogg"], mime: /^video\//, texto: "videos MP4, WEBM o MOV" },
  pdf: { ext: [".pdf"], mime: /^application\/pdf$/, texto: "PDF" },
};

/**
 * Subida de un archivo (campo «file») con validación de tipo y tamaño.
 * Los errores vuelven como 400 con un mensaje claro, nunca como página de error.
 *   crearUpload({ tipos: ["imagen", "video"], maxMB: { imagen: 5, video: 200 } })
 */
export const crearUpload = ({ tipos, maxMB }) => {
  const permitidos = tipos.map((t) => TIPOS[t]);
  const limiteMayor = Math.max(...tipos.map((t) => maxMB[t]));
  const descripcion = permitidos.map((t) => t.texto).join(" o ");

  const tipoDe = (file) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    return tipos.find((t) => TIPOS[t].ext.includes(ext) && TIPOS[t].mime.test(file.mimetype || ""));
  };

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, UPLOADS_DIR),
      filename: (req, file, cb) =>
        cb(null, `${Date.now()}-${crypto.randomBytes(3).toString("hex")}${path.extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: limiteMayor * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
      if (!tipoDe(file)) {
        const err = new Error("tipo");
        err.code = "TIPO_NO_PERMITIDO";
        return cb(err);
      }
      cb(null, true);
    },
  }).single("file");

  return (req, res, next) =>
    upload(req, res, async (err) => {
      const responder = (message, code) => res.status(400).json({ message, err: { message }, code });
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return responder(`El archivo es demasiado pesado. El máximo es ${limiteMayor} MB: elegí uno más liviano o comprimilo.`, "ARCHIVO_PESADO");
        }
        if (err.code === "TIPO_NO_PERMITIDO") {
          return responder(`Ese tipo de archivo no está permitido. Acá podés subir ${descripcion}.`, "TIPO_NO_PERMITIDO");
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") {
          return responder("Subí un solo archivo por vez.", "ARCHIVO_INVALIDO");
        }
        console.error("[upload] Error al recibir el archivo:", err?.message || err);
        return res.status(500).json({ message: "No pudimos guardar el archivo. Intentá de nuevo en unos minutos." });
      }
      if (!req.file) return responder(`Elegí un archivo para subir (${descripcion}).`, "ARCHIVO_FALTANTE");
      // Límite propio de cada tipo (por ejemplo, imágenes más chicas que los videos).
      const tipo = tipoDe(req.file);
      if (req.file.size > maxMB[tipo] * 1024 * 1024) {
        const fs = await import("fs/promises");
        await fs.unlink(req.file.path).catch(() => {});
        return responder(`El archivo es demasiado pesado. Para ${TIPOS[tipo].texto} el máximo es ${maxMB[tipo]} MB.`, "ARCHIVO_PESADO");
      }
      next();
    });
};
