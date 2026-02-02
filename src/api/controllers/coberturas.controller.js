// src/api/controllers/coberturas.controller.js
import coberturasServices from '../../services/coberturas.service.js';

class CoberturasController {

  async cotizarBasica(req, res, next) {
    try {
      const { id_tipo_transporte, id_duracion_viaje } = req.body;
      const result = await coberturasServices.calcularBasica(id_tipo_transporte, id_duracion_viaje);
      res.status(200).json(result);
    } catch (error) { next(error); }
  }

  async cotizarExceso(req, res, next) {
    try {
      const { id_tipo_transporte, id_duracion_viaje, id_alternativa } = req.body;
      const result = await coberturasServices.calcularExceso(id_tipo_transporte, id_duracion_viaje, id_alternativa);
      res.status(200).json(result);
    } catch (error) { next(error); }
  }

  async cotizarOpcional(req, res, next) {
    try {
      // Nota: Asumo que aquí envías datos para calcular opciones
      const result = await coberturasServices.calcularOpcional(req.body);
      res.status(200).json(result);
    } catch (error) { next(error); }
  }

  async cotizarTotal(req, res, next) {
    try {
      const result = await coberturasServices.calcularTotal(req.body);
      res.status(200).json(result);
    } catch (error) { next(error); }
  }
}

export default new CoberturasController();