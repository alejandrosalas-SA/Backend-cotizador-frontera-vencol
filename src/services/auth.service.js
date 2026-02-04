import { getConnection, sql } from '../database/connection.js';

class AuthService {
  
  // Tabla: [COTIZ].[USUARIOS] y [COTIZ].[ROLES_USUARIOS]
  async login(email, password) {
    const pool = await getConnection();
    
    // SP Esperado: sp_UserLogin
    // Debe hacer JOIN con COTIZ.ROLES_USUARIOS para devolver 'rol_nombre' y 'rol_id'
    // Debe validar contra COTIZ.USUARIOS where email = @Email AND status = 1
    const result = await pool.request()
      .input('Email', sql.VarChar, email)
      .input('Password', sql.VarChar, password) 
      .execute('sp_UserLogin');

    if (result.recordset.length === 0) {
      const error = new Error('Credenciales inválidas o usuario inactivo');
      error.status = 401;
      throw error;
    }

    return result.recordset[0];
  }

  async changePassword(email, oldPass, newPass) {
    const pool = await getConnection();

    // SP Esperado: sp_UserChangePassword
    // Actualiza tabla [COTIZ].[USUARIOS]
    const result = await pool.request()
      .input('Email', sql.VarChar, email)
      .input('PasswordOld', sql.VarChar, oldPass)
      .input('PasswordNew', sql.VarChar, newPass)
      .execute('sp_UserChangePassword');

    // Asumimos que el SP devuelve un SELECT con el mensaje, o controlamos por filas afectadas
    return {
      respuesta: 'Exitoso',
      justificacion: 'Contraseña actualizada correctamente'
    };
  }
}

export default new AuthService();