import SolicitudesService from '../../services/solicitudes.service.js';

class SolicitudesController {

  async crear(req, res, next) {
    try {
      // Se asume que el userId viene del token de autenticación (middleware)
      // Si no hay auth middleware aún, se puede enviar en el body temporalmente
      const userId = req.body.id_usuario_emite || 1; // Fallback temporal
      const result = await SolicitudesService.crearSolicitud(req.body, userId);
      res.status(201).json(result);
    } catch (error) { next(error); }
  }

  async listar(req, res, next) {
    try {
      const filtros = {
        fechaDesde: req.query.desde,
        fechaHasta: req.query.hasta,
        status: req.query.status
      };
      const data = await SolicitudesService.getSolicitudes(filtros);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async obtenerDetalle(req, res, next) {
    try {
      const { id } = req.params;
      const data = await SolicitudesService.getSolicitudDetalle(id);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async cambiarStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, id_usuario } = req.body;
      const result = await SolicitudesService.cambiarStatus(id, status, id_usuario);
      res.status(200).json(result);
    } catch (error) { next(error); }
  }
}

export default new SolicitudesController();