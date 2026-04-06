import EstadisticasService from '../../services/estadisticas.service.js';
import { getConnection, sql } from '../../database/connection.js';

// Obtiene las sucursales asignadas a un usuario desde COTIZ.USUARIOS_SUCURSAL
async function getSucursalesDeUsuario(userId) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('cod_emp', sql.VarChar(50), userId)
    .execute('COTIZ.sp_GetSucursalesUsuario');
  return result.recordset.map(r => r.id);
}

class EstadisticasController {

  async getMiniPanel(req, res, next) {
    try {
      const data = await EstadisticasService.getMiniPanel();
      res.status(200).json(data);
    } catch (error) { next(error); }
  }

  async getDashboard(req, res, next) {
    try {
      const rol = req.userRole;

      if (rol === 1) {
        // Admin: puede filtrar por una sucursal específica o ver todo global
        const idSucursal = req.query.id_sucursal ? parseInt(req.query.id_sucursal) : null;
        const sucursalesJson = idSucursal ? JSON.stringify([idSucursal]) : null;
        const data = await EstadisticasService.getDashboardFiltrado(sucursalesJson);
        return res.status(200).json(data);
      }

      if (rol === 2) {
        // Supervisor: filtrar por sus sucursales asignadas
        // Si además pasa ?id_sucursal=X, restringir a esa sucursal dentro de las suyas
        const sucursalesIds = await getSucursalesDeUsuario(req.userId);

        if (sucursalesIds.length === 0) {
          return res.status(200).json({
            kpis: { ingresos_mes_actual: 0, ingresos_mes_anterior: 0, porcentaje_crecimiento: 0, total_borradores: 0, total_emitidas: 0, tasa_conversion: 0, ticket_promedio: 0 },
            top_vehiculos: [], distribucion_transporte: [], rendimiento_sucursales: [], rendimiento_empleados: [],
          });
        }

        let idsAFiltrar = sucursalesIds;
        if (req.query.id_sucursal) {
          const idSolicitado = parseInt(req.query.id_sucursal);
          if (sucursalesIds.includes(idSolicitado)) {
            idsAFiltrar = [idSolicitado];
          }
        }

        const sucursalesJson = JSON.stringify(idsAFiltrar);
        const data = await EstadisticasService.getDashboardFiltrado(sucursalesJson);
        return res.status(200).json(data);
      }

      return res.status(403).json({ message: 'Sin permisos para ver estadísticas' });
    } catch (error) { next(error); }
  }
}

export default new EstadisticasController();
