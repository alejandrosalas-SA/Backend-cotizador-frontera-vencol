import SolicitudesService from '../../services/solicitudes.service.js';
import { getConnection, sql } from '../../database/connection.js';

// Obtiene IDs de sucursales asignadas al usuario desde COTIZ.USUARIOS_SUCURSAL
async function getSucursalesDeUsuario(userId) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('cod_emp', sql.VarChar(50), userId)
    .execute('COTIZ.sp_GetSucursalesUsuario');
  return result.recordset.map(r => r.id);
}

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
      const rol = req.userRole;

      if (rol === 1) {
        // Admin: puede filtrar por sucursal o ver todo
        const idSucursal = req.query.id_sucursal ? parseInt(req.query.id_sucursal) : null;
        const sucursalesJson = idSucursal ? JSON.stringify([idSucursal]) : null;
        const result = await SolicitudesService.getConteos(null, sucursalesJson);
        return res.status(200).json(result);
      }

      if (rol === 2) {
        // Supervisor: sus sucursales asignadas
        const sucursalesIds = await getSucursalesDeUsuario(req.userId);
        let idsAFiltrar = sucursalesIds;
        if (req.query.id_sucursal) {
          const idSolicitado = parseInt(req.query.id_sucursal);
          if (sucursalesIds.includes(idSolicitado)) idsAFiltrar = [idSolicitado];
        }
        const sucursalesJson = idsAFiltrar.length > 0 ? JSON.stringify(idsAFiltrar) : JSON.stringify([-1]);
        const result = await SolicitudesService.getConteos(null, sucursalesJson);
        return res.status(200).json(result);
      }

      // Empleado (rol 3): solo sus propias solicitudes
      const result = await SolicitudesService.getConteos(req.userId, null);
      res.status(200).json(result);
    } catch (error) { next(error); }
  }

  async listar(req, res, next) {
    try {
      const rol = req.userRole;

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

      const filtrosObj = Object.keys(filtros).length > 0 ? filtros : null;

      if (rol === 1) {
        // Admin: puede filtrar por una sucursal o ver todo
        const idSucursal = req.query.id_sucursal ? parseInt(req.query.id_sucursal) : null;
        const sucursalesJson = idSucursal ? JSON.stringify([idSucursal]) : null;
        const result = await SolicitudesService.getSolicitudes({
          idUsuario: null, filtros: filtrosObj, pagina, tamanoPagina, sucursalesJson,
        });
        return res.status(200).json(result);
      }

      if (rol === 2) {
        // Supervisor: sus sucursales (opcionalmente filtrar a una)
        const sucursalesIds = await getSucursalesDeUsuario(req.userId);
        let idsAFiltrar = sucursalesIds;
        if (req.query.id_sucursal) {
          const idSolicitado = parseInt(req.query.id_sucursal);
          if (sucursalesIds.includes(idSolicitado)) idsAFiltrar = [idSolicitado];
        }
        const sucursalesJson = idsAFiltrar.length > 0 ? JSON.stringify(idsAFiltrar) : JSON.stringify([-1]);
        const result = await SolicitudesService.getSolicitudes({
          idUsuario: null, filtros: filtrosObj, pagina, tamanoPagina, sucursalesJson,
        });
        return res.status(200).json(result);
      }

      // Empleado (rol 3): solo las suyas
      const result = await SolicitudesService.getSolicitudes({
        idUsuario: req.userId ?? null,
        filtros: filtrosObj,
        pagina,
        tamanoPagina,
        sucursalesJson: null,
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
