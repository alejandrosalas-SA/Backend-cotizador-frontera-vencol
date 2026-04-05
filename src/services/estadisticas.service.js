import { getConnection } from '../database/connection.js';

/*
=======================================================================
  T-SQL: COTIZ.sp_GetDashboardEstadisticas
  Ejecutar en SSMS para crear/actualizar el stored procedure.
=======================================================================

CREATE OR ALTER PROCEDURE COTIZ.sp_GetDashboardEstadisticas
AS
BEGIN
  SET NOCOUNT ON;

  -- ---------------------------------------------------------------
  -- RESULT SET 1: KPIs
  -- ---------------------------------------------------------------
  DECLARE @hoy          DATE         = CAST(GETDATE() AS DATE);
  DECLARE @ini_mes_act  DATE         = DATEFROMPARTS(YEAR(@hoy), MONTH(@hoy), 1);
  DECLARE @ini_mes_ant  DATE         = DATEADD(MONTH, -1, @ini_mes_act);
  DECLARE @fin_mes_ant  DATE         = DATEADD(DAY, -1, @ini_mes_act);

  -- Prima total = suma de primas de coberturas por solicitud
  WITH primas_por_solicitud AS (
    SELECT
      s.id,
      s.status,
      s.fecha_emision,
      s.id_sucursal,
      s.id_usuario,
      ISNULL(SUM(sc.prima), 0) AS prima_total
    FROM COTIZ.SOLICITUDES s
    LEFT JOIN COTIZ.SOLICITUDES_COBERTURAS sc ON sc.id_solicitud = s.id
    GROUP BY s.id, s.status, s.fecha_emision, s.id_sucursal, s.id_usuario
  ),
  kpi_mes_actual AS (
    SELECT
      ISNULL(SUM(prima_total), 0)   AS ingresos_mes_actual,
      COUNT(*)                       AS total_emitidas_mes
    FROM primas_por_solicitud
    WHERE status = 1
      AND fecha_emision >= @ini_mes_act
      AND fecha_emision <  DATEADD(MONTH, 1, @ini_mes_act)
  ),
  kpi_mes_anterior AS (
    SELECT ISNULL(SUM(prima_total), 0) AS ingresos_mes_anterior
    FROM primas_por_solicitud
    WHERE status = 1
      AND fecha_emision >= @ini_mes_ant
      AND fecha_emision <= @fin_mes_ant
  ),
  kpi_borradores AS (
    SELECT COUNT(*) AS total_borradores
    FROM COTIZ.SOLICITUDES
    WHERE status = 0
  )
  SELECT
    kma.ingresos_mes_actual,
    kman.ingresos_mes_anterior,
    CAST(
      CASE
        WHEN kman.ingresos_mes_anterior = 0 THEN 0
        ELSE (kma.ingresos_mes_actual - kman.ingresos_mes_anterior)
             * 100.0 / kman.ingresos_mes_anterior
      END
    AS DECIMAL(10,2)) AS porcentaje_crecimiento,
    kb.total_borradores,
    kma.total_emitidas_mes                                     AS total_emitidas,
    CAST(
      kma.total_emitidas_mes * 100.0
      / NULLIF(kma.total_emitidas_mes + kb.total_borradores, 0)
    AS DECIMAL(10,2))                                          AS tasa_conversion,
    CAST(
      kma.ingresos_mes_actual * 1.0
      / NULLIF(kma.total_emitidas_mes, 0)
    AS DECIMAL(18,3))                                          AS ticket_promedio
  FROM kpi_mes_actual  kma
  CROSS JOIN kpi_mes_anterior kman
  CROSS JOIN kpi_borradores   kb;

  -- ---------------------------------------------------------------
  -- RESULT SET 2: Top 10 vehículos
  -- ---------------------------------------------------------------
  SELECT TOP 10
    vm.descmarca + ' ' + vm.descmodelo  AS marca_modelo,
    COUNT(sv.id)                        AS cantidad_cotizaciones
  FROM COTIZ.SOLICITUDES_VEHICULO sv
  JOIN COTIZ.VVEH_MARCA_MODELO vm
    ON  CONVERT(smallint, sv.marca)  = vm.CODMARCA
    AND CONVERT(smallint, sv.modelo) = vm.codmodelo
  GROUP BY vm.descmarca, vm.descmodelo
  ORDER BY cantidad_cotizaciones DESC;

  -- ---------------------------------------------------------------
  -- RESULT SET 3: Distribución por tipo de transporte
  -- ---------------------------------------------------------------
  DECLARE @total_solicitudes INT = (SELECT COUNT(*) FROM COTIZ.SOLICITUDES);

  SELECT
    tv.nombre                                                  AS tipo_transporte_nombre,
    COUNT(sv.id)                                               AS cantidad,
    CAST(COUNT(sv.id) * 100.0 / NULLIF(@total_solicitudes, 0)
    AS DECIMAL(5,2))                                           AS porcentaje
  FROM COTIZ.SOLICITUDES_VEHICULO sv
  JOIN COTIZ.TIPO_VEHICULOS tv ON tv.id = sv.tipo_vehiculo
  GROUP BY tv.nombre
  ORDER BY cantidad DESC;

  -- ---------------------------------------------------------------
  -- RESULT SET 4: Rendimiento por sucursal
  -- ---------------------------------------------------------------
  SELECT
    suc.nombre                                                  AS sucursal,
    SUM(CASE WHEN sol.status = 0 THEN 1 ELSE 0 END)            AS borradores,
    SUM(CASE WHEN sol.status = 1 THEN 1 ELSE 0 END)            AS solicitudes_generadas
  FROM COTIZ.SOLICITUDES sol
  JOIN COTIZ.SUCURSALES suc ON suc.id = sol.id_sucursal
  GROUP BY suc.nombre
  ORDER BY solicitudes_generadas DESC;

  -- ---------------------------------------------------------------
  -- RESULT SET 5: Rendimiento por empleado
  -- ---------------------------------------------------------------
  SELECT
    u.nombre + ' ' + u.apellido                                AS nombre_completo,
    SUM(CASE WHEN sol.status = 1 THEN 1 ELSE 0 END)            AS total_generadas,
    SUM(CASE WHEN sol.status = 0 THEN 1 ELSE 0 END)            AS total_borradores,
    COUNT(sol.id)                                              AS total_procesadas,
    CAST(
      SUM(CASE WHEN sol.status = 1 THEN 1 ELSE 0 END) * 100.0
      / NULLIF(COUNT(sol.id), 0)
    AS DECIMAL(10,2))                                          AS tasa_cierre
  FROM COTIZ.SOLICITUDES sol
  JOIN COTIZ.USUARIOS u ON u.cod_emp = sol.id_usuario
  GROUP BY u.nombre, u.apellido
  ORDER BY total_generadas DESC;

END;
GO

=======================================================================
*/

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

  async getDashboard() {
    try {
      const pool = await getConnection();
      const result = await pool.request().execute('COTIZ.sp_GetDashboardEstadisticas');

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
}

export default new EstadisticasService();
