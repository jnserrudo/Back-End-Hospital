// Importamos las dependencias
import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import { router } from "./src/routes/main.js";
import { encabezadosSeguridad } from "./src/middlewares/seguridad.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path"; // Importa el módulo 'path'
const filename = fileURLToPath(import.meta.url);
const dirnamex = dirname(filename);
// console.log("filename: ", filename, "dirnamex:", dirnamex);
// Configuración de la aplicación
// La API no arranca sin un secreto JWT propio (antes había un valor por defecto inseguro).
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error(
    "\n[config] Falta JWT_SECRET en el archivo .env (o tiene menos de 16 caracteres).\n" +
      "         Agregá una línea JWT_SECRET=<valor largo y aleatorio> y volvé a iniciar el servidor.\n"
  );
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
// Detrás de nginx (VPS): TRUST_PROXY=1 para que los límites de intentos vean la IP real de cada persona.
if (process.env.TRUST_PROXY) app.set("trust proxy", /^\d+$/.test(process.env.TRUST_PROXY) ? +process.env.TRUST_PROXY : process.env.TRUST_PROXY);
app.use(encabezadosSeguridad);

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Configuración del middleware CORS
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .concat([
    "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173",
    "http://172.19.32.1:3000",
    "http://172.20.64.1:3000",
    "http://195.200.0.39",
    "https://195.200.0.39",
    // Temporal (DuckDNS) hasta tener dominio definitivo
    "http://onativia.duckdns.org",
    "https://onativia.duckdns.org",
  ]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);

//Como hostear react directo desde express? Asi -->
//Primero le decimos a express que use todos los archivos del build de react asi:
const staticPath = path.join(
  dirnamex,
  "../Front-End-Hospital/Front-End-Hospital/dist"
);
// console.log("Static Path: ", staticPath);

app.use(express.static(staticPath));

//Luego le decimos a express que sirva todo eso desde el home

const front = (req, res) => {
  const indexPath = path.join(staticPath, "index.html");
  // console.log("Serving index.html from: ", indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send(err);
    }
  });
};

// Middleware para analizar JSON
app.use(json({ limit: "2mb" }));

// Rutas de la aplicación

app.use("/api", router);

// Servir el frontend en la ruta raíz
app.get("/", front);

// Manejar todas las demás rutas para React

/**
 * ¿Por qué se necesitan ambas?
Ruta raíz ("/"): Específicamente para cuando un usuario accede a la página principal. Aunque podrías depender
solo de app.get('*', front);, tener app.get("/", front); puede ser útil para optimización o claridad en el código.

Rutas no reconocidas ("*"): Captura todas las demás rutas, garantizando que el servidor siempre sirva index.html
para que React pueda manejar la navegación. Es esencial para aplicaciones SPA (Single Page Application), donde 
las rutas son manejadas por el frontend y no por el servidor.

En resumen, mientras que app.get("/", front); se asegura de que la ruta raíz funcione correctamente, 
app.get('*', front); garantiza que todas las demás rutas también sirvan la aplicación React, permitiendo que 
React Router maneje la navegación.
* 
*/

// Manejo central de errores: CORS, subida de archivos, JSON inválido y errores inesperados.
// Al cliente siempre le llega un mensaje claro; el detalle técnico queda en el log.
app.use((err, req, res, next) => {
  if (!err) return next();
  const reply = (status, message) => res.status(status).json({ message, err: { message } });
  if (err.message === "No permitido por CORS") {
    console.error(`[CORS] Origen rechazado: ${req.headers.origin}`);
    return reply(403, "Esta dirección no tiene permiso para usar la aplicación.");
  }
  if (err.name === "MulterError") {
    console.error("[upload]", err.code, err.message);
    if (err.code === "LIMIT_FILE_SIZE") return reply(413, "El archivo es demasiado grande. Elegí uno más liviano e intentá de nuevo.");
    return reply(400, "No pudimos recibir el archivo. Revisá que sea un solo archivo y volvé a intentar.");
  }
  if (err.message?.startsWith("Solo se permiten")) {
    return reply(400, `${err.message}. Elegí otro archivo.`);
  }
  if (err.type === "entity.parse.failed") {
    return reply(400, "Los datos enviados tienen un formato incorrecto. Actualizá la página y volvé a intentar.");
  }
  if (err.type === "entity.too.large") {
    return reply(413, "Los datos enviados son demasiado grandes.");
  }
  console.error("[API] Error no controlado:", err);
  return reply(500, "Ocurrió un error inesperado. Intentá de nuevo en unos minutos; si sigue pasando, avisá al administrador.");
});

// console.log(path.join(dirnamex, "uploads"));
// Servir archivos estáticos
// fallthrough: false → si el archivo no existe responde 404 (antes caía en el index.html del front con 200).
app.use("/uploads", express.static(path.join(dirnamex, "src", "uploads"), { fallthrough: false }));

app.use("/uploads", (err, req, res, next) => {
  if (err?.status === 404 || err?.statusCode === 404) return res.status(404).json({ message: "No encontramos ese archivo." });
  next(err);
});

const PORT = process.env.PORT ?? 1234;

app.get("*", front);
app.listen(PORT, () => {
  // console.log("servidor escuchando en el puerto  http://localhost:1234");
});
