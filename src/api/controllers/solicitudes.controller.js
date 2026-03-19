import SolicitudesService from '../../services/solicitudes.service.js';

class SolicitudesController {

  async crear(req, res, next) {
    try {
      const userId = req.userId || req.body.id_usuario_emite;
      const result = await SolicitudesService.crearSolicitud(req.body, userId);
      res.status(201).json(result);
    } catch (error) { next(error); }
  }

  async listar(req, res, next) {
    try {
      const filtros = {};

      // Si no es admin, filtramos por sus propias solicitudes
      const esAdmin = req.userRole && (req.userRole === 'Admin' || req.userRole === 'Administrador' || req.userRole === 1);
      if (!esAdmin && req.userId) {
        filtros.idUsuario = req.userId;
      }

      const data = await SolicitudesService.getSolicitudes(filtros);
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async obtenerDetalle(req, res, next) {
    try {
      const { id } = req.params;
      const data = await SolicitudesService.getSolicitudDetalle(id);
      if (!data) return res.status(404).json({ message: 'Solicitud no encontrada' });
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { status = 0, ...rest } = req.body;
      const result = await SolicitudesService.actualizarBorrador(id, status, rest);
      res.status(200).json(result);
    } catch (error) { next(error); }
  }

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const result = await SolicitudesService.eliminarSolicitud(id);
      res.status(200).json(result);
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