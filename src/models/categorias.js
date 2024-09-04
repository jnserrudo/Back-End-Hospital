import { PrismaClient } from "@prisma/client";

const prisma =new PrismaClient()
export class CategoriaModel{

    static getAll=async()=>{
        try {
            const patologias=await prisma.categoria.findMany({
                where: {
                  habilitado: 1
                }
              })
            /* console.log(data)
            const patologias=await data.json()
            NO ES NECESARIO CONVERTIR A JSON
             */return patologias    
        } catch (error) {
            return {
                err:error
            }
        }

        
    }

    static getCategoriabyId=async(id)=>{
        try {
            id=+id
            const categoria=await prisma.categoria.findFirst({
                where:{
                    id:id
                }
            }) 
            return categoria    
        } catch (error) {
            return {
                err:error
            }
        }

        
    }

    static updateCategoria=async(id,patologiaUpdated)=>{
        try {
            const categoria=await prisma.categoria.update({
                where:{
                    id:+id
                },
                data:patologiaUpdated
            }) 
            return categoria    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

    static addCategoria=async(dataCategoria)=>{
        try {
            const newCategoria=await prisma.categoria.create({
                data:dataCategoria
            })
            
            return newCategoria    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

    static disable = async (id) => {
        try {
          // Deshabilitar la patología
      const categoria = await prisma.categoria.update({
        where: { id: +id },
        data: { habilitado: 0 }
      });

      // Deshabilitar las relaciones en CategoriaPaciente
      await prisma.patologiaPaciente.updateMany({
        where: { patologiaId: id },
        data: { habilitado: 0 }
      });

      // Deshabilitar las relaciones en CategoriaReceta
      await prisma.patologiaReceta.updateMany({
        where: { patologiaId: id },
        data: { habilitado: 0 }
      });

      // Deshabilitar las relaciones en CategoriaInformacion
      await prisma.patologiaInformacion.updateMany({
        where: { patologiaId: id },
        data: { habilitado: 0 }
      });

      // Deshabilitar las relaciones en CategoriaEjercicio
      await prisma.patologiaEjercicio.updateMany({
        where: { patologiaId: id },
        data: { habilitado: 0 }
      });

      return { message: "Patología y entidades relacionadas deshabilitadas con éxito" };
        } catch (error) {
          return {
            err: error,
          };
        }
      };

}