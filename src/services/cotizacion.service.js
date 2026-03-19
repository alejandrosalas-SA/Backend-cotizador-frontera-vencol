import { getConnection, sql } from '../database/connection.js';
import { parseSqlJson } from '../utils/sqlParser.js';

class CotizacionService {
    async calcularCotizacion(vehiculoData, nroVersion = null) {
        const pool = await getConnection();
        const jsonVehiculo = JSON.stringify(vehiculoData);

        const result = await pool.request()
            .input('JsonVehiculo', sql.NVarChar(sql.MAX), jsonVehiculo)
            .input('NroVersionBuscada', sql.VarChar(sql.MAX), nroVersion)
            .execute('COTIZ.sp_Calculo_Dinamico');

        let cotizacion = parseSqlJson(result.recordset[0]);
        if (!cotizacion) {
            throw new Error('No se obtuvo respuesta del cálculo.');
        }

        if (cotizacion.error) {
            throw new Error(cotizacion.error);
        }

        return cotizacion;
    }
}

export default new CotizacionService();
