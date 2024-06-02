import { ACCEPTED_ORIGINS } from "../../app.js"

import { MovieModel } from "../models/movies.js"

//import { MovieModel } from "../models/database/movies.js"

import { validateMovie, validatePartialMovie } from "../schemas/movies.js"

//un contrato son las interfaces o abstracciones que definen las propiedades y metodos que una clase debe implementar
export class MovieController{
    //Los métodos estáticos son llamados sin instanciar su clase. Son habitualmente utilizados para crear funciones para una aplicación.
    static getMovies=async (req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }
        
            //ahora vamos a traer el moviesModel, esto me devolveria las peliculas 
            //las trae, la idea es que se vea que las traiga y que no se muestre el como desde aca
            
            const movies= await MovieModel.getMovies()
            //SI HAY UN ASYNC AWAIT SE DEBEN MANEJAR LOS ERRORES, COMO UN TRY CATCH, ESTO SE LO VERA MAS ADELANTE
            res.json(movies)  
        
    
    }

    static getMoviesToCarrusel=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const portadas=await MovieModel.getMoviesToCarrusel()

        res.json(portadas)
    }

    static getAllMovies=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const movies=await MovieModel.getAllMovies()

        res.json(movies)
    }

    static getMoviesProximas=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const movies=await MovieModel.getMoviesProximas()

        res.json(movies)
    }

    static getMoviesEstrenos=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const movies=await MovieModel.getMoviesEstrenos()

        res.json(movies)
    }

    static getMoviesVentasAnticipadas=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const movies=await MovieModel.getMoviesVentasAnticipadas()

        res.json(movies)
    }

    static getMovies2D=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const movies=await MovieModel.getMovies2D()

        res.json(movies)
    }

    static getMovies3D=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const movies=await MovieModel.getMovies3D()

        res.json(movies)
    }

    static getMovies4D=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const movies=await MovieModel.getMovies4D()

        res.json(movies)
    }

    static getMoviesXD=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const movies=await MovieModel.getMoviesXD()

        res.json(movies)
    }

    static getMoviesDBOX=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const movies=await MovieModel.getMoviesDBOX()

        res.json(movies)
    }

    static getMoviesPremiumClass=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const movies=await MovieModel.getMoviesPremiumClass()

        res.json(movies)
    }

    static getMoviesConfort=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const movies=await MovieModel.getMoviesConfort()

        res.json(movies)
    }

    static getMoviesProximamente=async(req,res)=>{
        const origin=req.header('origin')
            if(ACCEPTED_ORIGINS.includes(origin)||!origin){
                res.header('Access-Control-Allow-Origin',origin)
        
            }

        const movies=await MovieModel.getMoviesProximamente()

        res.json(movies)
    }


    static create=async (req,res)=>{
        
        const result=validateMovie(req.body)
    
        if(result.error){
            //tambien se podria usar el 422 Unprocessable Entity
            return res.status(400).json( {error: JSON.parse(result.error.message)})
        }
    
    
        const {title,year,director,duration,poster,genre,rate}=req.body
    
    
        const newMovie= await MovieModel.create({input:result.data})
        
        res.status(201).json(newMovie)
    }

    static delete=async (req,res)=>{

        const origin=req.header('origin')
        if(ACCEPTED_ORIGINS.includes(origin)||!origin){
            res.header('Access-Control-Allow-Origin',origin)
            
        }
    
        const {id}=req.params
       
        const result=await MovieModel.delete({id})
        if (!result){
            return res.status(404).json({message:'Movie not found'})
        }
    
        return res.json({message:'Movie deleted'})
    
    }

    static update =async (req,res)=>{
    
        const result=validatePartialMovie(req.body)
        if(result.error){
            res.status(400).json({error: JSON.parse(result.error.message)})
        }
    
        const {id}=req.params
    
        const updatedMovie=await MovieModel.update({id, input : result.data})
    
        return res.json(updatedMovie)
    
    }

}


