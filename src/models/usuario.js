import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';


const prisma = new PrismaClient();
export class UsuarioModel {
  static getAll = async () => {
    try {
      console.log("model usuario");
      const usuarios = await prisma.usuario.findMany();
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
      console.log("model usuario",user);
      const rol = await prisma.usuario.findFirst({
        where: {
          usuario: user,
        },
      });

      console.log(rol)
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
      // Obtener el usuario actual
      const usuario = await prisma.usuario.findUnique({
        where: { id: +id },
      });

      if (!usuario) {
        return { err: "Usuario no encontrado" };
      }

      // Cambiar el estado de 'blanqueado' entre 0 y 1
      const nuevoEstadoBlanqueado = usuario.blanqueado === 0 ? 1 : 0;

      // Actualizar el usuario con el nuevo estado de 'blanqueado'
      const usuarioActualizado = await prisma.usuario.update({
        where: { id: +id },
        data: { blanqueado: nuevoEstadoBlanqueado },
      });

      return usuarioActualizado;
    } catch (error) {
      return { err: error.message };
    }
  };

  static addUsuario = async (dataUsuario) => {
    try {
      const { idRol, idPatologias, ...restoDataUsuario } = dataUsuario;

      const newUsuario = await prisma.usuario.create({
        data: {
          ...restoDataUsuario,
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
              create: idPatologias.map((idPatologia) => ({
                patologiaId: idPatologia,
              })),
            },
          },
        });

        return { newUsuario, newPaciente };
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
      console.log("usuarioValidated: ", usuarioValidated,usuarioValidated.id)
      if (usuarioValidated?.id > 0) {
        //usuario validado, devolver token
        let token = jwt.sign({ usuario }, "ozuna", {
          expiresIn: "30m",
        });

        let values={
          token,
          dni: usuarioValidated.dni,
          id: usuarioValidated.id,
          blanqueado: usuarioValidated.blanqueado,
        };
        console.log("values: ",values)

        return values
      } else {
        //usuario no validado
        console.log("Usuario no valido")
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
  
      if (result && await bcrypt.compare(password, result.password)) {
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
}
