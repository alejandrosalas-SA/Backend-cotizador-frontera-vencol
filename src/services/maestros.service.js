import { getConnection, sql } from '../database/connection.js';

class MaestrosService {
  
  // Tabla: COTIZ.SUCURSALES (Asumida, no estaba en el script pero necesaria por endpoint)
  async getSucursales() {
    const pool = await getConnection();
    const result = await pool.request().execute('sp_GetSucursales');
    return result.recordset;
  }

  // Tabla: COTIZ.DURACION_VIAJE
  async getDuracionViaje() {
    const pool = await getConnection();
    const result = await pool.request().execute('sp_GetDuracionViaje');
    return result.recordset;
  }

  // Lógica de negocio (Posiblemente COTIZ.TASACION_ESPECIAL o DEFINICION_TERMINOS)
  async getTipoExceso() {
    const pool = await getConnection();
    const result = await pool.request().execute('sp_GetTipoExceso');
    return result.recordset;
  }

  // Tabla: COTIZ.TIPO_VEHICULOS
  async getTipoTransporte() {
    const pool = await getConnection();
    const result = await pool.request().execute('sp_GetTipoTransporte');
    return result.recordset;
  }

  // Tabla: COTIZ.TASACION_ESPECIAL
  async getTasacionEspecial() {
    const pool = await getConnection();
    const result = await pool.request().execute('sp_GetTasacionEspecial');
    return result.recordset;
  }

  // Tabla: COTIZ.INTERMEDIARIOS
  async getIntermediarios() {
    const pool = await getConnection();
    const result = await pool.request().execute('sp_GetIntermediarios');
    return result.recordset;
  }

  // Vista: [COTIZ].[VVEH_MARCA_MODELO]
  // Se agrega para soportar el selector de vehículos del cotizador
  async getMarcas() {
    const pool = await getConnection();
    // SP Esperado: SELECT DISTINCT CODMARCA, descmarca FROM [COTIZ].[VVEH_MARCA_MODELO]
    const result = await pool.request().execute('sp_GetMarcasVehiculo');
    return result.recordset;
  }

  async getModelos(codMarca) {
    const pool = await getConnection();
    // SP Esperado: SELECT codmodelo, descmodelo FROM [COTIZ].[VVEH_MARCA_MODELO] WHERE CODMARCA = @CodMarca
    const result = await pool.request()
      .input('CodMarca', sql.VarChar, codMarca)
      .execute('sp_GetModelosVehiculo');
    return result.recordset;
  }
}

export default new MaestrosService();