// TODO: Debo crear los store procedures de MaestroService
// src/services/maestros.service.js
import { getConnection } from '../database/connection.js';

class MaestrosService {
  
  async getSucursales() {
    const pool = await getConnection();
    // Ejecuta SP: sp_GetSucursales
    const result = await pool.request().execute('sp_GetSucursales');
    return result.recordset;
  }

  async getDuracionViaje() {
    const pool = await getConnection();
    // Ejecuta SP: sp_GetDuracionViaje
    const result = await pool.request().execute('sp_GetDuracionViaje');
    return result.recordset;
  }

  async getTipoExceso() {
    const pool = await getConnection();
    // Ejecuta SP: sp_GetTipoExceso
    const result = await pool.request().execute('sp_GetTipoExceso');
    return result.recordset;
  }

  async getTipoTransporte() {
    const pool = await getConnection();
    // Ejecuta SP: sp_GetTipoTransporte
    const result = await pool.request().execute('sp_GetTipoTransporte');
    return result.recordset;
  }

  async getTasacionEspecial() {
    const pool = await getConnection();
    // Ejecuta SP: sp_GetTasacionEspecial
    const result = await pool.request().execute('sp_GetTasacionEspecial');
    return result.recordset;
  }
}

export default new MaestrosService();