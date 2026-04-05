import EstadisticasService from '../../services/estadisticas.service.js';

class EstadisticasController {

  async getMiniPanel(req, res, next) {
    try {
      const data = await EstadisticasService.getMiniPanel();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getDashboard(req, res, next) {
    try {
      const data = await EstadisticasService.getDashboard();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }
}

export default new EstadisticasController();
