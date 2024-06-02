import { ConsultaModel } from "../models/consulta.js";

export class ConsultaController {
  static getAll = async (req, res) => {
    const consultas = await ConsultaModel.getAll();
    if (!consultas) {
      res.json({ message: "Consulta no encontrada" }).status(404);
    } else {
      res.json(consultas);
    }
  };

  static getConsultaByDni = async (req, res) => {
    let dni = req.params.dni;
    console.log(dni)
    const consulta = await ConsultaModel.getConsultaByDni(dni);
    if (!consulta) {
      res.json({ message: "Consulta no encontrada" }).status(404);
    } else {
      res.json(consulta);
    }
  };

  static getConsultaById = async (req, res) => {
    let id = req.params.id;
    const consulta = await ConsultaModel.getConsultaById(id);
    if (!consulta) {
      res.json({ message: "Consulta no encontrada" }).status(404);
    } else {
      res.json(consulta);
    }
  };

  static updateConsulta = async (req, res) => {
    let id = req.params.id;
    const consulta = await ConsultaModel.updateConsulta(id, req.body);
    if (!consulta) {
      res.json({ message: "Consulta no encontrada" }).status(404);
    } else {
      res.json(consulta);
    }
  };

  static addConsulta = async (req, res) => {
    const consulta = await ConsultaModel.addConsulta(req.body);
    res.json(consulta);
  };
}
