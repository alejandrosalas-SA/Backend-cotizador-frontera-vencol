import { getConnection, sql } from '../database/connection.js';

class TarifasService {

  // Tabla: COTIZ.TARIFAS (con JOIN a tablas maestras para etiquetas)
  async getTarifas() {
    try {
      const pool = await getConnection();
      const result = await pool.request().execute('COTIZ.sp_GetTarifas');
      return result.recordset;
    } catch (error) {
      throw new Error(`Error al obtener tarifas: ${error.message}`);
    }
  }

  // Actualiza la prima de una tarifa por id
  async updateTarifa(id, prima, userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Id', sql.Int, id)
        .input('Prima', sql.Decimal(18, 3), prima)
        .input('IdUsuario', sql.VarChar(50), userId)
        .output('Resultado', sql.VarChar(200))
        .execute('COTIZ.sp_UpdateTarifa');

      const resultado = result.output.Resultado;
      if (resultado && resultado.startsWith('ERROR')) {
        throw new Error(resultado);
      }
      return { mensaje: resultado };
    } catch (error) {
      throw new Error(`Error al actualizar tarifa: ${error.message}`);
    }
  }

  // Tabla: COTIZ.TASAS_OPCIONALES (con JOIN a DEFINICION_TERMINOS para nombre)
  async getTasasOpcionales() {
    try {
      const pool = await getConnection();
      const result = await pool.request().execute('COTIZ.sp_GetTasasOpcionales');
      return result.recordset;
    } catch (error) {
      throw new Error(`Error al obtener tasas opcionales: ${error.message}`);
    }
  }

  // Actualiza la tasa de una cobertura opcional por id
  async updateTasaOpcional(id, tasa, userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Id', sql.Int, id)
        .input('Tasa', sql.Decimal(18, 6), tasa)
        .input('IdUsuario', sql.VarChar(50), userId)
        .output('Resultado', sql.VarChar(200))
        .execute('COTIZ.sp_UpdateTasaOpcional');

      const resultado = result.output.Resultado;
      if (resultado && resultado.startsWith('ERROR')) {
        throw new Error(resultado);
      }
      return { mensaje: resultado };
    } catch (error) {
      throw new Error(`Error al actualizar tasa opcional: ${error.message}`);
    }
  }
}

export default new TarifasService();