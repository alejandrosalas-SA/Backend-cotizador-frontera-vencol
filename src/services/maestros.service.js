import { getConnection, sql } from '../database/connection.js';

class MaestrosService {

  // Tabla: COTIZ.SUCURSALES
  async getSucursales() {
    const pool = await getConnection();
    const result = await pool.request().execute('COTIZ.sp_GetSucursales');
    return result.recordset;
  }

  // SP: COTIZ.sp_GetSucursalesUsuario
  async getSucursalesUsuario(codEmp) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('cod_emp', codEmp) // asumiendo VarChar, revisar si es int
      .execute('COTIZ.sp_GetSucursalesUsuario');
    return result.recordset;
  }

  // Tabla: COTIZ.DURACION_VIAJE
  async getDuracionViaje() {
    const pool = await getConnection();
    const result = await pool.request().execute('COTIZ.sp_GetDuracionViaje');
    return result.recordset;
  }

  // Tabla: COTIZ.TIPO_EXCESO
  async getTipoExceso() {
    const pool = await getConnection();
    const result = await pool.request().execute('COTIZ.sp_GetTipoExceso');
    return result.recordset;
  }

  // Tabla: COTIZ.TIPO_VEHICULOS
  async getTipoTransporte() {
    const pool = await getConnection();
    const result = await pool.request().execute('COTIZ.sp_GetTipoTransporte');
    return result.recordset;
  }

  // Tabla: COTIZ.TASACION_ESPECIAL
  async getTasacionEspecial() {
    const pool = await getConnection();
    const result = await pool.request().execute('COTIZ.sp_GetTasacionEspecial');
    return result.recordset;
  }

  // Tabla: COTIZ.INTERMEDIARIOS
  // REGLA DE NEGOCIO: La "Persona Autorizada para Cotizar" es un Intermediario.
  async getIntermediarios() {
    const pool = await getConnection();
    const result = await pool.request().execute('COTIZ.sp_GetIntermediarios');
    return result.recordset;
  }

  // Tabla: COTIZ.DEFINICION_TERMINOS
  async getDefinicionTerminos() {
    const pool = await getConnection();
    const result = await pool.request().execute('COTIZ.sp_GetDefinicionTerminos');
    return result.recordset;
  }

  // Tabla: COTIZ.ROLES_USUARIOS
  async getRolesUsuarios() {
    const pool = await getConnection();
    const result = await pool.request().execute('COTIZ.sp_GetRolesUsuarios');
    return result.recordset;
  }

  // Tabla: COTIZ.SUMAS_ASEGURADAS
  async getSumasAseguradas(tipoExceso) {
    const pool = await getConnection();
    const request = pool.request();
    if (tipoExceso) {
      request.input('TipoExceso', sql.Int, tipoExceso);
    }
    const result = await request.execute('COTIZ.sp_GetSumasAseguradas');

    // Retorna los 3 result sets como un objeto estructurado, parseando cada uno si viene como JSON
    return {
      basico: this._parseRecordset(result.recordsets[0]),
      exceso: this._parseRecordset(result.recordsets[1]),
      opcional: this._parseRecordset(result.recordsets[2])
    };
  }

  // Helper privado para parsear recordsets que pueden venir de FOR JSON PATH
  _parseRecordset(recordset) {
    if (!recordset || recordset.length === 0) return [];

    // Si es un JSON Result Set (una sola fila con una columna JSON_...)
    const firstRow = recordset[0];
    const jsonKey = Object.keys(firstRow).find(key => key.startsWith('JSON_'));

    if (jsonKey && typeof firstRow[jsonKey] === 'string') {
      try {
        const parsed = JSON.parse(firstRow[jsonKey]);
        // Para las listas siempre devolvemos el array completo
        return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
      } catch (e) {
        console.error('Error parseando array JSON desde SQL:', e);
        return [];
      }
    }

    // Si no es JSON, es un recordset estandar de filas
    return recordset;
  }

  // Tabla: COTIZ.SUMAS_ASEGURADAS — actualizar valor por id
  async updateSumaAsegurada(id, valor, userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('Id', sql.Int, id)
        .input('Valor', sql.Decimal(18, 2), valor)
        .input('IdUsuario', sql.VarChar(50), userId)
        .output('Resultado', sql.VarChar(200))
        .execute('COTIZ.sp_UpdateSumaAsegurada');

      const resultado = result.output.Resultado;
      if (resultado && resultado.startsWith('ERROR')) {
        throw new Error(resultado);
      }
      return { mensaje: resultado };
    } catch (error) {
      throw new Error(`Error al actualizar suma asegurada: ${error.message}`);
    }
  }

  // Tabla: COTIZ.VERSIONES — versión activa más reciente
  async getVersionActual() {
    const pool = await getConnection();
    const result = await pool.request().execute('COTIZ.sp_GetVersionActual');
    return result.recordset[0] || null;
  }

  // Vista: [COTIZ].[VVEH_MARCA_MODELO]
  async getMarcas() {
    const pool = await getConnection();
    const result = await pool.request().execute('COTIZ.sp_GetMarcasVehiculo');
    return result.recordset;
  }

  async getModelos(codMarca) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('CodMarca', sql.VarChar(3), codMarca)
      .execute('COTIZ.sp_GetModelosVehiculo');
    return result.recordset;
  }
}

export default new MaestrosService();