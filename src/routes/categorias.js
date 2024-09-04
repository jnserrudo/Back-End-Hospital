import express from "express";
import { CategoriaController } from "../controllers/categorias.js";


export const categoriaRouter=express.Router()

categoriaRouter.get('/', CategoriaController.getAll)

categoriaRouter.get('/:id', CategoriaController.getCategoriabyId)

categoriaRouter.put('/:id', CategoriaController.updateCategoria)

categoriaRouter.put('/inhabilitar/:id', CategoriaController.disable)

categoriaRouter.post('/',CategoriaController.addCategoria)

