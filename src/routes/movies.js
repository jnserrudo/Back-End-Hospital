import { Router } from "express";
//Router es una clase poco especial, que nos permitira crear un enrutador a partir del cual vamos a poder responder todas las path
export const moviesRouter = Router()

import { MovieController } from "../controllers/movies.js";

//lo importante es que aqui no ponemos el 'movies'
///LO QUE VAMOS A HACER ES QUE TODAS LAS REQUEST QUE TENGAN /movies VAN A RESPONDER A ESTE ROUTER
//QUE ESTAMOS CREANDO , ES COMO QUE ESTAMOS SEPARANDO UNA RAMA DE NUESTRO ENRUTADOR EN UN ARCHIVO SEPARADO
//Y NOS PERMITIRA TENER ES NUESTRO ARCHIVO app, LAS RUTAS MUCHO MAS FACILES DE ENTENDER Y TODO LO
//QUE TENGA QUE VER CON /MOVIES TENERLO TOTALMENTE SEPARADO 

moviesRouter.get('/',MovieController.getMovies)

moviesRouter.get('/carrusel',MovieController.getMoviesToCarrusel)

moviesRouter.get('/peliculas',MovieController.getAllMovies)

moviesRouter.get('/proximas',MovieController.getMoviesProximas)

moviesRouter.get('/estrenos',MovieController.getMoviesEstrenos)

moviesRouter.get('/ventasanticipadas',MovieController.getMoviesVentasAnticipadas)

moviesRouter.get('/2d',MovieController.getMovies2D)

moviesRouter.get('/3d',MovieController.getMovies3D)

moviesRouter.get('/4d',MovieController.getMovies4D)

moviesRouter.get('/xd',MovieController.getMoviesXD)

moviesRouter.get('/dbox',MovieController.getMoviesDBOX)

moviesRouter.get('/premiumclass',MovieController.getMoviesPremiumClass)

moviesRouter.get('/confort',MovieController.getMoviesConfort)

moviesRouter.get('/proximamente',MovieController.getMoviesProximamente)

//moviesRouter.post('/',MovieController.create)

moviesRouter.delete('/:id',MovieController.delete)

moviesRouter.patch('/:id',MovieController.update)