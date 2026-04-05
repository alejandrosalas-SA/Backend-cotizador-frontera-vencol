// src/api/controllers/maestros.controller.js
import MaestroServices from '../../services/maestros.service.js';

class MaestrosController {

  async getSucursales(req, res, next) {
    try {
      const data = await MaestroServices.getSucursales();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getSucursalesUsuario(req, res, next) {
    try {
      const { codEmp } = req.params;
      const data = await MaestroServices.getSucursalesUsuario(codEmp);
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

  // REGLA DE NEGOCIO: La "Persona Autorizada para Cotizar" es un Intermediario.
  async getIntermediarios(req, res, next) {
    try {
      const data = await MaestroServices.getIntermediarios();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getDefinicionTerminos(req, res, next) {
    try {
      const data = await MaestroServices.getDefinicionTerminos();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getRolesUsuarios(req, res, next) {
    try {
      const data = await MaestroServices.getRolesUsuarios();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getSumasAseguradas(req, res, next) {
    try {
      const tipoExceso = req.params.tipoExceso ? parseInt(req.params.tipoExceso, 10) : null;
      const data = await MaestroServices.getSumasAseguradas(tipoExceso);
      console.log(data);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async updateSumaAsegurada(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { valor } = req.body;
      const userId = req.userId;
      const data = await MaestroServices.updateSumaAsegurada(id, valor, userId);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getVersionActual(req, res, next) {
    try {
      const data = await MaestroServices.getVersionActual();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  // Basados en la vista VVEH_MARCA_MODELO
  async getMarcas(req, res, next) {
    try {
      const data = await MaestroServices.getMarcas();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getModelos(req, res, next) {
    try {
      const { codMarca } = req.params;
      const data = await MaestroServices.getModelos(codMarca);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }
}

export default new MaestrosController();