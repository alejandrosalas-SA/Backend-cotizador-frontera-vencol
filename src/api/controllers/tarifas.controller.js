import TarifasService from '../../services/tarifas.service.js';

class TarifasController {

  async getTarifas(req, res, next) {
    try {
      const data = await TarifasService.getTarifas();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async updateTarifa(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { prima } = req.body;
      const userId = req.userId;
      const data = await TarifasService.updateTarifa(id, prima, userId);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getTasasOpcionales(req, res, next) {
    try {
      const data = await TarifasService.getTasasOpcionales();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async updateTasaOpcional(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { tasa } = req.body;
      const userId = req.userId;
      const data = await TarifasService.updateTasaOpcional(id, tasa, userId);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }
}

export default new TarifasController();