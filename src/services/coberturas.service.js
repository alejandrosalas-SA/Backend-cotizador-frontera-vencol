// TODO: Debo crear los store procedures de CoberturasService
import { getConnection, sql } from '../database/connection.js';

class CoberturasService {
  
  async calcularBasica(idTipoTransporte, idDuracionViaje) {
    const pool = await getConnection();
    
    // Delegamos la lógica al SP: sp_CotizarBasica
    const result = await pool.request()
      .input('IdTipoTransporte', sql.Int, idTipoTransporte)
      .input('IdDuracionViaje', sql.Int, idDuracionViaje)
      .execute('sp_CotizarBasica');

    // Retornamos la primera fila (se asume que el SP devuelve una fila con columna 'valor')
    return result.recordset[0] || { valor: 0 };
  }

  async calcularExceso(idTipoTransporte, idDuracionViaje, idAlternativa) {
    const pool = await getConnection();

    // Delegamos la lógica al SP: sp_CotizarExceso
    const result = await pool.request()
      .input('IdTipoTransporte', sql.Int, idTipoTransporte)
      .input('IdDuracionViaje', sql.Int, idDuracionViaje)
      .input('IdAlternativa', sql.Int, idAlternativa)
      .execute('sp_CotizarExceso');

    // El SP debe devolver un SELECT con las columnas exactas que requiere el frontend
    // Ej: Valor_Muerte, Valor_Daños, etc.
    return result.recordset[0] || {};
  }

  async calcularOpcional(data) {
    const pool = await getConnection();

    // Puedes pasar un JSON string si son muchos datos opcionales, o parámetros individuales
    const result = await pool.request()
      // Ejemplo: si data trae { id_cobertura: 1, ... }
      // .input('IdCobertura', sql.Int, data.id_cobertura)
      .execute('sp_CotizarOpcional');

    return result.recordset[0];
  }

  async calcularTotal(data) {
    const pool = await getConnection();

    // SP que quizás suma todo lo guardado en una tabla temporal o recalcula en base a IDs
    const result = await pool.request()
        // .input('IdCotizacion', sql.Int, data.id_cotizacion) // Ejemplo
        .execute('sp_CotizarTotal');

    return result.recordset[0];
  }
}

export default new CoberturasService();
/* 

### ⚠️ Lo que debes crear en SQL Server ahora

Para que este código funcione, tu base de datos debe tener estos Stored Procedures creados. Aquí te dejo un **ejemplo rápido** de cómo se vería el de `sp_CotizarBasica` en SQL para que te sirva de guía:

sql
-- Ejemplo de lo que necesitas en tu BD
CREATE PROCEDURE sp_CotizarBasica
    @IdTipoTransporte INT,
    @IdDuracionViaje INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Aquí va tu lógica de negocio que antes estaba en JS
    DECLARE @TarifaBase DECIMAL(18,2);
    DECLARE @FactorDuracion DECIMAL(18,2);

    -- Simulación de obtener valores de tablas de configuración
    SELECT @TarifaBase = PrecioBase FROM TarifasTransporte WHERE Id = @IdTipoTransporte;
    SELECT @FactorDuracion = Factor FROM FactoresDuracion WHERE Id = @IdDuracionViaje;

    -- Cálculo final
    SELECT (@TarifaBase * @FactorDuracion) as valor;
END */