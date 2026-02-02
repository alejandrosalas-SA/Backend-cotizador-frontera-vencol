// TODO: Debo crear los store procedures de authService
import { getConnection, sql } from '../database/connection.js';

class AuthService {
  
  async login(email, password) {
    const pool = await getConnection();
    
    // Ejecución de Stored Procedure (SP)
    // SP Esperado: [dbo].[sp_UserLogin]
    // Parámetros: @Email, @Password
    const result = await pool.request()
      .input('Email', sql.VarChar, email)
      .input('Password', sql.VarChar, password) // En prod, enviar hash o validar hash en backend
      .execute('sp_UserLogin');

    // Validación de la respuesta del SP
    if (result.recordset.length === 0) {
      const error = new Error('Credenciales inválidas');
      error.status = 401;
      throw error;
    }

    return result.recordset[0];
  }

  async changePassword(email, oldPass, newPass) {
    const pool = await getConnection();

    // SP Esperado: [dbo].[sp_UserChangePassword]
    const result = await pool.request()
      .input('Email', sql.VarChar, email)
      .input('PasswordOld', sql.VarChar, oldPass)
      .input('PasswordNew', sql.VarChar, newPass)
      .execute('sp_UserChangePassword');

    return {
      respuesta: 'Exitoso',
      justificacion: 'Contraseña actualizada correctamente' // O leer output del SP
    };
  }
}

export default new AuthService();