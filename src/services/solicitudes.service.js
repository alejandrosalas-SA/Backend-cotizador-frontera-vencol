import { getConnection, sql } from '../database/connection.js';

class SolicitudesService {

  // Crear una nueva solicitud (Guardar Borrador o Emitir)
  // Recibe un objeto complejo con toda la estructura del formulario
  async crearSolicitud(data, userId) {
    const pool = await getConnection();
    
    // Convertimos los objetos anidados a JSON string para pasarlos al SP
    // SQL Server puede parsear JSON con OPENJSON, lo cual simplifica insertar en múltiples tablas
    const jsonSolicitante = JSON.stringify(data.solicitante);
    const jsonVehiculo = JSON.stringify(data.vehiculo);
    const jsonCoberturas = JSON.stringify(data.coberturas); // Array con Basica y Exceso
    const jsonOpcionales = JSON.stringify(data.opcionales);

    // SP Esperado: [COTIZ].[sp_CrearSolicitudCompleta]
    // Este SP debe:
    // 1. Insertar en SOLICITUDES (Status inicial: 1-Emitido o 0-Borrador)
    // 2. Obtener el ID generado.
    // 3. Insertar en SOLICITUDES_SOLICITANTE, _VEHICULO, _COBERTURAS, _OPCIONAL usando ese ID.
    const result = await pool.request()
      .input('IdUsuario', sql.Int, userId)
      .input('JsonSolicitante', sql.NVarChar(sql.MAX), jsonSolicitante)
      .input('JsonVehiculo', sql.NVarChar(sql.MAX), jsonVehiculo)
      .input('JsonCoberturas', sql.NVarChar(sql.MAX), jsonCoberturas)
      .input('JsonOpcionales', sql.NVarChar(sql.MAX), jsonOpcionales)
      .input('Observaciones', sql.VarChar(sql.MAX), data.observaciones)
      .input('Condiciones', sql.VarChar(sql.MAX), data.condiciones)
      .output('IdSolicitud', sql.Int)
      .execute('sp_CrearSolicitudCompleta');

    return { 
      id_solicitud: result.output.IdSolicitud,
      mensaje: 'Solicitud creada correctamente'
    };
  }

  // Listar solicitudes (para grid de administración)
  async getSolicitudes(filtros) {
    const pool = await getConnection();
    // Filtros opcionales: fecha, estatus, usuario
    const result = await pool.request()
      .input('FechaDesde', sql.Date, filtros.fechaDesde)
      .input('FechaHasta', sql.Date, filtros.fechaHasta)
      .input('Status', sql.Int, filtros.status)
      .execute('sp_GetSolicitudes'); // Retorna JOIN con Solicitante y Vehiculo basico
    
    return result.recordset;
  }

  // Obtener detalle completo de una solicitud (para imprimir o ver)
  async getSolicitudDetalle(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('IdSolicitud', sql.Int, id)
        .execute('sp_GetSolicitudDetalle');
        
    // El SP debería devolver múltiples recordsets o un JSON forjado
    // Asumimos que devuelve un JSON completo forjado por SQL (FOR JSON PATH)
    // Si devuelve recordsets separados, habría que armar el objeto aquí.
    return result.recordset[0]; 
  }

  // Cambiar estatus (Emitido -> Procesado/Anulado)
  async cambiarStatus(idSolicitud, nuevoStatus, userId) {
    const pool = await getConnection();
    await pool.request()
      .input('IdSolicitud', sql.Int, idSolicitud)
      .input('NuevoStatus', sql.Int, nuevoStatus)
      .input('IdUsuario', sql.Int, userId) // Quien hace el cambio
      .execute('sp_CambiarStatusSolicitud');
      
    return { mensaje: 'Estatus actualizado correctamente' };
  }
}

export default new SolicitudesService();