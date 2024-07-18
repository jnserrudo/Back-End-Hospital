import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../../procesoEmail.js";

const prisma = new PrismaClient();
export class UsuarioModel {
  static getAll = async () => {
    try {
      console.log("model usuario");
      const usuarios = await prisma.usuario.findMany({
        where: {
          habilitado: 1,
        },
      });
      console.log("resultado de usuario en el modelo: ", usuarios);
      /* console.log(data)
        const usuarios=await data.json()
        NO ES NECESARIO CONVERTIR A JSON
         */ return usuarios;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getRolByUser = async (user) => {
    try {
      console.log("model usuario", user);
      const rol = await prisma.usuario.findFirst({
        where: {
          usuario: user,
        },
      });

      console.log(rol);
      return rol?.idRol;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getAllRoles = async () => {
    try {
      console.log("model usuario");
      const roles = await prisma.rol.findMany();

      return roles;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getAllRolesToEdit = async (idRol) => {
    try {
      console.log("getAllRolesToEdit", idRol);
      const roles = await prisma.rol.findMany({
        where: {
          id: {
            notIn: [+idRol],
          },
        },
      });

      return roles;
    } catch (error) {
      console.log(error);
      return {
        err: error,
      };
    }
  };

  static getUsuariobyId = async (id) => {
    try {
      id = +id;
      const usuario = await prisma.usuario.findFirst({
        where: {
          id: id,
        },
      });
      return usuario;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static updateUsuario = async (id, usuarioUpdated) => {
    try {
      const usuario = await prisma.usuario.update({
        where: {
          id: +id,
        },
        data: usuarioUpdated,
      });
      return usuario;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  // Función para actualizar la contraseña
  static updatePassword = async (id, newPassword) => {
    try {
      // Encriptar la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar el usuario con la nueva contraseña y cambiar el estado de blanqueado
      const usuario = await prisma.usuario.update({
        where: {
          id: +id,
        },
        data: {
          password: hashedPassword,
          blanqueado: 1,
        },
      });

      return usuario;
    } catch (error) {
      return {
        err: error.message,
      };
    }
  };

  static blanquearUsuario = async (id) => {
    try {
      // Iniciar una transacción
      const result = await prisma.$transaction(async (prisma) => {
        // Generar una nueva contraseña temporal
        const nuevaContrasena = crypto.randomBytes(3).toString("hex"); // Genera una contraseña corta

        console.log("Nueva contraseña temporal: ", nuevaContrasena);

        // Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashContrasena = await bcrypt.hash(nuevaContrasena, salt);

        // Actualizar el usuario con la nueva contraseña y establecer 'blanqueado' a 0
        const usuarioActualizado = await prisma.usuario.update({
          where: { id: +id },
          data: {
            password: hashContrasena,
            blanqueado: 0,
          },
        });

        // Enviar el correo con la nueva contraseña
        const emailResponse = await sendPasswordResetEmail(
          usuarioActualizado.email,
          nuevaContrasena
        );

        console.log("emailResponse,emailResponse.statusCode: ",emailResponse,emailResponse.statusCode)
        // Verificar si el envío del correo fue exitoso
        if (emailResponse.err) {
          throw new Error("Error al enviar el correo");
        }

        return usuarioActualizado;
      });

      return result;
    } catch (error) {
      console.log("Catch del error: ",error.message)
      return { err: error.message };
    }
  };

  static addUsuario = async (dataUsuario) => {
    try {
      const { idRol, idsPatologias, password,email, ...restoDataUsuario } =
        dataUsuario;

      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUsuario = await prisma.usuario.create({
        data: {
          ...restoDataUsuario,
          email:email,
          password: hashedPassword, // Guardar la contraseña encriptada
          rol: {
            connect: { id: idRol },
          },
        },
      });

      if (idRol === 3) {
        // Asumiendo que el rol de paciente tiene id 3
        const newPaciente = await prisma.paciente.create({
          data: {
            idUsuario: newUsuario.id,
            legajo: "",
            fichaRegistro: "",
            fichaSalud: "",
            resultadosEstudios: "",
            informes: "",
            seguimiento: "",
            diariosIngesta: "",
            diariosActividadFisica: "",
            registroFotografico: "",
            indicacionesPrescripciones: "",
            patologia: {
              create: idsPatologias.map((idPatologia) => ({
                patologiaId: idPatologia,
              })),
            },
          },
        });

        const emailResponse=await sendPasswordResetEmail(newUsuario.email, password) 
        if (emailResponse.err) {
          throw new Error("Error al enviar el correo");
        }
        return { newUsuario, newPaciente };
      }

      const emailResponse=await sendPasswordResetEmail(newUsuario.email, password) 
        if (emailResponse.err) {
          throw new Error("Error al enviar el correo");
        }
      //lo pongo en un objeto, para poder tratarlo y hacer validaciones a esta llamada desde el front
      return { newUsuario };
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getJwtToken = async (usuario, password) => {
    try {
      let usuarioValidated = await this.validateUsuario(usuario, password);
      console.log("usuarioValidated: ", usuarioValidated, usuarioValidated.id);
      if (usuarioValidated?.id > 0) {
        //usuario validado, devolver token
        let token = jwt.sign({ usuario }, "ozuna", {
          expiresIn: "30m",
        });

        let values = {
          token,
          dni: usuarioValidated.dni,
          id: usuarioValidated.id,
          blanqueado: usuarioValidated.blanqueado,
        };
        console.log("values: ", values);

        return values;
      } else {
        //usuario no validado
        console.log("Usuario no valido");
        return {
          err: "Usuario no valido",
        };
      }
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static validateUsuario = async (usuario, password) => {
    console.log("validate usuario: ", usuario, password);

    try {
      const result = await prisma.usuario.findFirst({
        where: {
          usuario: usuario,
        },
      });

      if (result && (await bcrypt.compare(password, result.password))) {
        return {
          dni: result.dni,
          id: result.id,
          blanqueado: result.blanqueado,
        };
      } else {
        return false;
      }
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static disable = async (id) => {
    try {
      const usuario = await prisma.usuario.update({
        where: { id: +id },
        data: { habilitado: 0 },
      });
      return usuario;
    } catch (error) {
      return {
        err: error,
      };
    }
  };

  static getPatologiaToUsuarioEdit = async (id) => {
    try {
      id = +id;
  
      // Obtener todas las patologías
      const todasLasPatologias = await prisma.patologia.findMany();
  
      // Obtener el usuario y el paciente asociado con sus patologías
      const usuario = await prisma.usuario.findUnique({
        where: { id: id },
        include: {
          paciente: {
            include: {
              patologia: {
                include: {
                  patologia: true,
                },
              },
            },
          },
        },
      });
  
      // Verificar si el usuario tiene un paciente asociado
      const paciente = usuario?.paciente;
      const patologiasAsociadas = paciente?.patologia.map((p) => p.patologia) || [];
      const patologiasAsociadasIds = new Set(patologiasAsociadas.map((p) => p.id));
  
      const patologiasNoAsociadas = todasLasPatologias.filter(
        (p) => !patologiasAsociadasIds.has(p.id)
      );
  
      return { patologiasAsociadas, patologiasNoAsociadas };
    } catch (error) {
      return { err: error.message };
    }
  };
  
}
