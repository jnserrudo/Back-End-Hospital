import { PrismaClient } from "@prisma/client";

const prisma =new PrismaClient()
export class PacienteModel{

    static getAll=async()=>{
        try {
            const pacientes=await prisma.paciente.findMany({
                where: {
                  habilitado: 1
                }
              })
            /* console.log(data)
            const pacientes=await data.json()
            NO ES NECESARIO CONVERTIR A JSON
             */return pacientes    
        } catch (error) {
            return {
                err:error
            }
        }

        
    }

    static getPacientebyDni=async(dni)=>{
        try {
            dni=+dni
            const paciente=await prisma.paciente.findFirst({
                where:{
                    dni:dni
                }
            }) 
            return paciente    
        } catch (error) {
            return {
                err:error
            }
        }
    }

    static getInformacionxPaciente = async (idUsuario) => {
        try {
          idUsuario = +idUsuario;
      
          // Obtener el paciente a partir del idUsuario
          const paciente = await prisma.paciente.findUnique({
            where: {
              idUsuario: idUsuario
            },
            include: {
              patologia: {
                include: {
                  patologia: {
                    include: {
                      informacion: {
                        include: {
                          informacion: true
                        }
                      }
                    }
                  }
                }
              }
            }
          });
      
          if (!paciente) {
            throw new Error("Paciente no encontrado");
          }
      
          // Extraer las informaciones relacionadas con las patologías del paciente
          const informaciones = paciente.patologia
            .flatMap((patologiaPaciente) => patologiaPaciente.patologia.informacion)
            .map((patologiaInformacion) => patologiaInformacion.informacion);
      
          return informaciones;
        } catch (error) {
          return {
            err: error.message
          };
        }
      };
      
      static getEjerciciosxPaciente = async (idUsuario) => {
        try {
          idUsuario = +idUsuario;
      
          // Obtener el paciente a partir del idUsuario
          const paciente = await prisma.paciente.findFirst({
            where: {
              idUsuario: idUsuario
            },
            include: {
              patologia: {
                include: {
                  patologia: {
                    include: {
                      ejercicio: {
                        include: {
                          ejercicio: true
                        }
                      }
                    }
                  }
                }
              }
            }
          });
      
          if (!paciente) {
            throw new Error("Paciente no encontrado");
          }
      
          // Extraer los ejercicios relacionados con las patologías del paciente
          const ejercicios = paciente.patologia
            .flatMap((patologiaPaciente) => patologiaPaciente.patologia.ejercicio)
            .map((patologiaEjercicio) => patologiaEjercicio.ejercicio);
      
          return ejercicios;
        } catch (error) {
          return {
            err: error.message
          };
        }
      };
      


    static updatePaciente=async(dni,pacienteUpdated)=>{
        try {
            const paciente=await prisma.paciente.update({
                where:{
                    dni:+dni
                },
                data:pacienteUpdated
            }) 
            return paciente    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }

    static addPaciente=async(dataPaciente)=>{
        try {
            const newPaciente=await prisma.paciente.create({
                data:dataPaciente
            })
            
            return newPaciente    
        } catch (error) {
            return {
                err:error
            }
        }
        
    }
    static disable = async (id) => {
        try {
          const paciente= await prisma.paciente.update({
            where: { id: +id },
            data: { habilitado: 0 }
          });
          return paciente;
        } catch (error) {
          return {
            err: error,
          };
        }
      };
}