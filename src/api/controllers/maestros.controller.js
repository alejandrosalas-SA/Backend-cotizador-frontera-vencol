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

  async getIntermediarios(req, res, next) {
    try {
      const data = await MaestroServices.getIntermediarios();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  //basados en la vista VVEH_MARCA_MODELO
  async getMarcas(req, res, next) {
    try {
      const data = await MaestroServices.getMarcas();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getModelos(req, res, next) {
    try {
      const { codMarca } = req.params; // Se recibe por URL
      const data = await MaestroServices.getModelos(codMarca);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }
}

export default new MaestrosController();