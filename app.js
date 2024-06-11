// Importamos las dependencias
import express, { json } from 'express';
import cors from 'cors';
import { router } from './src/routes/main.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path'; // Importa el módulo 'path'
const filename = fileURLToPath(import.meta.url);
const dirnamex = dirname(filename);
console.log("filename: ",filename,"dirnamex:",dirnamex)
// Configuración de la aplicación
const app = express();
app.disable('x-powered-by');

// Middleware para registrar los orígenes aceptados
const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234',
    'http://localhost:5173',
    'http://localhost:5175',
    'http://moviesdea.com',
    'http://jnsix.com'
];

import { PrismaClient } from "@prisma/client";

const prisma =new PrismaClient()

// Configuración del middleware CORS
app.use(cors({
    origin: '*'/* (origin, callback) => {
        // Permite solicitudes sin origen (por ejemplo, aplicaciones móviles)
        if (!origin) return callback(null, true);
        if (ACCEPTED_ORIGINS.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            return callback(new Error('No permitido por CORS'));
        }
    } */
}));

//Como hostear react directo desde express? Asi --> 
//Primero le decimos a express que use todos los archivos del build de react asi:
const staticPath = path.join(dirnamex, '../Front-End-Hospital/Front-End-Hospital/dist');
console.log("Static Path: ", staticPath);


app.use(express.static(staticPath));


//Luego le decimos a express que sirva todo eso desde el home

const front=(req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    console.log("Serving index.html from: ", indexPath);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("Error sending index.html:", err);
        res.status(500).send(err);
      }
    });
  }

app.get("/", front);
  
  


// Middleware para analizar JSON
app.use(json());

/* 
app.use('/', async()=> {
    try {
        await prisma.$connect();
        console.log('Conexión exitosa a la base de datos');
      } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
      } finally {
        await prisma.$disconnect();
      }
} ); */
// Rutas de la aplicación

app.use('/api', router);

// Manejo de errores CORS
app.use((err, req, res, next) => {
    if (err) {
        console.error(err.message);
        res.status(403).send('No permitido por CORS');
    } else {
        next();
    }
});

const PORT= process.env.PORT??1234

app.listen(PORT,()=>{
    console.log('servidor escuchando en el puerto  http://localhost:1234')
})