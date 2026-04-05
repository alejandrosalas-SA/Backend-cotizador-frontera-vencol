import SolicitudesService from '../../services/solicitudes.service.js';

class SolicitudesController {

  async crear(req, res, next) {
    try {
      const userId = req.userId || req.body.id_usuario_emite;
      const result = await SolicitudesService.crearSolicitud(req.body, userId);
      res.status(201).json(result);
    } catch (error) { next(error); }
  }

  async conteos(req, res, next) {
    try {
      const esAdmin = req.userRole && (
        req.userRole === 'Admin' ||
        req.userRole === 'Administrador' ||
        req.userRole === 1
      );
      const result = await SolicitudesService.getConteos(esAdmin ? null : (req.userId ?? null));
      res.status(200).json(result);
    } catch (error) { next(error); }
  }

  async listar(req, res, next) {
    try {
      const esAdmin = req.userRole && (
        req.userRole === 'Admin' ||
        req.userRole === 'Administrador' ||
        req.userRole === 1
      );

      const pagina       = Math.max(1, parseInt(req.query.pagina) || 1);
      const tamanoPagina = Math.min(200, Math.max(1, parseInt(req.query.tamanoPagina) || 10));

      const filtros = {};
      if (req.query.solicitante?.trim()) filtros.solicitante = req.query.solicitante.trim();
      if (req.query.vehiculo?.trim())    filtros.vehiculo    = req.query.vehiculo.trim();
      if (req.query.status !== undefined && req.query.status !== '') {
        const statusNum = parseInt(req.query.status);
        if (!isNaN(statusNum)) filtros.status = statusNum;
      }
      if (req.query.fechaDesde?.trim()) filtros.fechaDesde = req.query.fechaDesde.trim();
      if (req.query.fechaHasta?.trim()) filtros.fechaHasta = req.query.fechaHasta.trim();

      const result = await SolicitudesService.getSolicitudes({
        idUsuario:    esAdmin ? null : (req.userId ?? null),
        filtros:      Object.keys(filtros).length > 0 ? filtros : null,
        pagina,
        tamanoPagina,
      });

      res.status(200).json(result);
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