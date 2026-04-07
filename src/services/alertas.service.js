import { getConnection, sql } from '../database/connection.js';

class AlertasService {
  /**
   * Retorna las solicitudes en borrador (status=0) cuyos propietarios llevan
   * al menos @diasMinimos días sin concretar.
   * Cada fila incluye: cod_emp, email, nombre_empleado, id_solicitud,
   * fecha_emision, dias_transcurridos, solicitante_nombre, vehiculo_placa.
   */
  async getBorradoresPorEmpleado(diasMinimos = 7) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('DiasMinimos', sql.Int, diasMinimos)
      .execute('COTIZ.sp_GetBorradoresPorEmpleado');
    return result.recordset ?? [];
  }

  /**
   * Marca como vencidas (status=3) todas las solicitudes en borrador con
   * 15 o más días desde fecha_emision.
   * Retorna { solicitudes_expiradas: number }.
   */
  async expirarBorradoresVencidos() {
    const pool = await getConnection();
    const result = await pool.request()
      .execute('COTIZ.sp_ExpirarBorradoresVencidos');
    return result.recordset[0] ?? { solicitudes_expiradas: 0 };
  }
}

export default new AlertasService();
