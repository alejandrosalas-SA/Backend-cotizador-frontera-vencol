import { getConnection } from '../database/connection.js';

class EstadisticasService {

  async getMiniPanel() {
    try {
      const pool = await getConnection();
      const result = await pool.request().execute('COTIZ.sp_GetMiniPanelEstadisticas');

      return {
        top_vehiculos:          result.recordsets[0] ?? [],
        rendimiento_sucursales: result.recordsets[1] ?? [],
      };
    } catch (error) {
      throw new Error(`Error al obtener el mini panel de estadísticas: ${error.message}`);
    }
  }

  // Estadísticas filtradas por sucursales.
  // sucursalesJson = null  → globales (admin sin filtro)
  // sucursalesJson = '[1,3]' → solo esas sucursales (supervisor o admin filtrando)
  async getDashboardFiltrado(sucursalesJson = null) {
    try {
      const pool = await getConnection();
      const request = pool.request();

      // Usamos el SP con soporte de filtrado
      // Si @SucursalesJson es NULL el SP retorna datos globales
      request.input('SucursalesJson', sucursalesJson);

      const result = await request.execute('COTIZ.sp_GetDashboardEstadisticasSucursal');

      const kpisRow = result.recordsets[0][0] ?? {};

      return {
        kpis: {
          ingresos_mes_actual:    kpisRow.ingresos_mes_actual    ?? 0,
          ingresos_mes_anterior:  kpisRow.ingresos_mes_anterior  ?? 0,
          porcentaje_crecimiento: kpisRow.porcentaje_crecimiento ?? 0,
          total_borradores:       kpisRow.total_borradores       ?? 0,
          total_emitidas:         kpisRow.total_emitidas         ?? 0,
          tasa_conversion:        kpisRow.tasa_conversion        ?? 0,
          ticket_promedio:        kpisRow.ticket_promedio        ?? 0,
        },
        top_vehiculos:           result.recordsets[1] ?? [],
        distribucion_transporte: result.recordsets[2] ?? [],
        rendimiento_sucursales:  result.recordsets[3] ?? [],
        rendimiento_empleados:   result.recordsets[4] ?? [],
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas del dashboard: ${error.message}`);
    }
  }

  // Mantener para compatibilidad si aún se usa en algún lugar
  async getDashboard() {
    return this.getDashboardFiltrado(null);
  }
}

export default new EstadisticasService();
