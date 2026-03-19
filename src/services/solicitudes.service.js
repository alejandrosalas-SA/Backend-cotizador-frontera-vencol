import { getConnection, sql } from '../database/connection.js';

class SolicitudesService {

  // Crear una nueva solicitud (Guardar Borrador o Emitir)
  async crearSolicitud(data, userId) {
    const pool = await getConnection();
    console.log(data);
    const jsonSolicitante = JSON.stringify(data.solicitante);
    const jsonVehiculo = JSON.stringify(data.vehiculo);
    const jsonCoberturas = JSON.stringify(data.coberturas);
    const jsonOpcionales = JSON.stringify(data.opcionales);

    const result = await pool.request()
      .input('IdUsuario', sql.VarChar(50), userId)
      .input('JsonSolicitante', sql.NVarChar(sql.MAX), jsonSolicitante)
      .input('JsonVehiculo', sql.NVarChar(sql.MAX), jsonVehiculo)
      .input('JsonCoberturas', sql.NVarChar(sql.MAX), jsonCoberturas)
      .input('JsonOpcionales', sql.NVarChar(sql.MAX), jsonOpcionales)
      .input('Observaciones', sql.VarChar(sql.MAX), data.observaciones)
      .input('Condiciones', sql.VarChar(sql.MAX), data.condiciones)
      .input('StatusSolicitud', sql.Int, data.status)
      .input('NroVersion', sql.VarChar(sql.MAX), data.nro_version)
      .output('IdSolicitud', sql.Int)
      .execute('COTIZ.sp_CrearSolicitudCompleta');

    return {
      id_solicitud: result.output.IdSolicitud,
      mensaje: 'Solicitud creada correctamente'
    };
  }

  // Listar solicitudes (para grid de administración)
  async getSolicitudes(filtros) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('IdUsuario', sql.VarChar(50), filtros.idUsuario ?? null)
      .execute('COTIZ.SP_ObtenerSolicitudes');

    return result.recordset;
  }

  // Obtener detalle completo de una solicitud
  async getSolicitudDetalle(id) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('IdSolicitud', sql.Int, parseInt(id))
      .execute('COTIZ.SP_ObtenerDetalleSolicitud');

    // El SP retorna 3 recordsets: cabecera, coberturas, opcionales
    const cabecera = result.recordsets[0]?.[0] ?? null;
    const coberturas = result.recordsets[1] ?? [];
    const opcionales = result.recordsets[2] ?? [];

    if (!cabecera) return null;

    return { ...cabecera, coberturas, opcionales };
  }

  // Actualizar borrador: recibe datos completos + nuevo status
  async actualizarBorrador(id, nuevoStatus, data) {
    const pool = await getConnection();
    console.log(data);
    const request = pool.request()
      .input('IdSolicitud', sql.Int, parseInt(id))
      .input('NuevoStatus', sql.Int, nuevoStatus)
      .input('JsonSolicitante', sql.NVarChar(sql.MAX), data.solicitante ? JSON.stringify(data.solicitante) : null)
      .input('JsonVehiculo', sql.NVarChar(sql.MAX), data.vehiculo ? JSON.stringify(data.vehiculo) : null)
      .input('JsonCoberturas', sql.NVarChar(sql.MAX), data.coberturas ? JSON.stringify(data.coberturas) : null)
      .input('JsonOpcionales', sql.NVarChar(sql.MAX), data.opcionales ? JSON.stringify(data.opcionales) : null)
      .input('Condiciones', sql.VarChar(sql.MAX), data.condiciones ?? null)
      .input('Observaciones', sql.VarChar(sql.MAX), data.observaciones ?? null)
      .output('Resultado', sql.VarChar(200));

    const result = await request.execute('COTIZ.SP_ActualizarBorrador');
    const resultado = result.output.Resultado;

    if (resultado && resultado.startsWith('ERROR')) {
      throw new Error(resultado);
    }

    return { mensaje: resultado };
  }

  // Eliminar solicitud en cascada
  async eliminarSolicitud(id) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('IdSolicitud', sql.Int, parseInt(id))
      .output('Resultado', sql.VarChar(200))
      .execute('COTIZ.SP_EliminarSolicitud');

    const resultado = result.output.Resultado;
    if (resultado && resultado.startsWith('ERROR')) {
      throw new Error(resultado);
    }

    return { mensaje: 'Solicitud eliminada correctamente' };
  }

  // Cambiar estatus (Emitido -> Procesado/Anulado) — mantener para compatibilidad
  async cambiarStatus(idSolicitud, nuevoStatus, userId) {
    const pool = await getConnection();
    await pool.request()
      .input('IdSolicitud', sql.Int, idSolicitud)
      .input('NuevoStatus', sql.Int, nuevoStatus)
      .input('IdUsuario', sql.VarChar(50), userId)
      .execute('sp_CambiarStatusSolicitud');

    return { mensaje: 'Estatus actualizado correctamente' };
  }
}

export default new SolicitudesService();