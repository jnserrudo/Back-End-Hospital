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
app.use(express.static(dirnamex + "../Front-End/Front-End-Hospital/dist"));
//Luego le decimos a express que sirva todo eso desde el home
app.get("/", (req, res) => {
    res.sendFile(path.join(dirnamex, "../Front-End/Front-End-Hospital/dist", "index.html"))
});


// Middleware para analizar JSON
app.use(json());

// Rutas de la aplicación
app.use('/api', ()=>console.log("dea")/* router */);

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