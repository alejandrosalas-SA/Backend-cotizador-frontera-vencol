// src/api/controllers/maestros.controller.js
import MaestroServices from '../../services/maestros.service.js';

class MaestrosController {
  
  async getSucursales(req, res, next) {
    try {
      const data = await MaestroServices.getSucursales();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getDuracionViaje(req, res, next) {
    try {
      const data = await MaestroServices.getDuracionViaje();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getTipoExceso(req, res, next) {
    try {
      const data = await MaestroServices.getTipoExceso();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getTipoTransporte(req, res, next) {
    try {
      const data = await MaestroServices.getTipoTransporte();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getTasacionEspecial(req, res, next) {
    try {
      const data = await MaestroServices.getTasacionEspecial();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }
}

export default new MaestrosController();