import { PrismaClient } from "@prisma/client";

const prisma =new PrismaClient()
export class PatologiaModel{

    static getAll=async()=>{
        try {
            const patologias=await prisma.patologia.findMany({
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

    static getPatologiabyId=async(id)=>{
        try {
            id=+id
            const patologia=await prisma.patologia.findFirst({
                where:{
                    id:id
                }
            }) 
            return patologia    
        } catch (error) {
            return {
                err:error
            }
        }

        
    }

    static updatePatologia=async(id,patologiaUpdated)=>{
        try {
            const patologia=await prisma.patologia.update({
                where:{
                    id:+id
                },
                data:patologiaUpdated
            }) 
            return patologia    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

    static addPatologia=async(dataPatologia)=>{
        try {
            const newPatologia=await prisma.patologia.create({
                data:dataPatologia
            })
            
            return newPatologia    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

    static disable = async (id) => {
        try {
          // Deshabilitar la patología
      const patologia = await prisma.patologia.update({
        where: { id: +id },
        data: { habilitado: 0 }
      });

      // Deshabilitar las relaciones en PatologiaPaciente
      await prisma.patologiaPaciente.updateMany({
        where: { patologiaId: id },
        data: { habilitado: 0 }
      });

      // Deshabilitar las relaciones en PatologiaReceta
      await prisma.patologiaReceta.updateMany({
        where: { patologiaId: id },
        data: { habilitado: 0 }
      });

      // Deshabilitar las relaciones en PatologiaInformacion
      await prisma.patologiaInformacion.updateMany({
        where: { patologiaId: id },
        data: { habilitado: 0 }
      });

      // Deshabilitar las relaciones en PatologiaEjercicio
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