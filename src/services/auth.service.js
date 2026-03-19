import { getConnection, sql } from '../database/connection.js';
import { parseSqlJson } from '../utils/sqlParser.js';
import bcrypt from 'bcryptjs';

class AuthService {

  // Tabla: [COTIZ].[USUARIOS] y [COTIZ].[ROLES_USUARIOS]
  async login(email, password) {
    console.log('Login attempt for:', email);
    const pool = await getConnection();

    // Llamamos al SP pasándole solo el correo.
    // El SP debe retornar los datos del usuario incluyendo el hash de la contraseña.
    const result = await pool.request()
      .input('correo', sql.VarChar, email)
      .execute('COTIZ.sp_UserLogin');

    const user = parseSqlJson(result.recordset[0]);

    // Validaciones básicas del SP
    if (!user || user.estatus === 0) {
      const error = new Error(user?.comentario || 'Credenciales inválidas o usuario inactivo');
      error.status = 401;
      throw error;
    }

    // Validar si el usuario tiene contraseña seteada
    if (!user.contraseñaBD) {
      const error = new Error('No tienes contraseña. Debes crear tu contraseña');
      error.status = 401;
      throw error;
    }

    // Comparamos la contraseña en texto plano enviada por el frontend con el hash de la BD
    const isMatch = await bcrypt.compare(password, user.contraseñaBD);

    if (!isMatch) {
      const error = new Error('Contraseña Inválida');
      error.status = 401;
      throw error;
    }

    // Eliminamos el hash de la respuesta por seguridad
    delete user.contraseñaBD;

    return user;
  }

  async changePassword(email, oldPass, newPass) {
    // Para simplificar, primero verificamos la contraseña actual usando bcrypt
    const pool = await getConnection();

    const checkUser = await pool.request()
      .input('Email', sql.VarChar, email)
      .query('SELECT password FROM [COTIZ].[USUARIOS] WHERE email = @Email');

    if (checkUser.recordset.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const currentHash = checkUser.recordset[0].password;
    const isMatch = await bcrypt.compare(oldPass, currentHash);

    if (!isMatch) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPass, salt);

    // Actualizar en la BD usando el SP existente de creación (que es un simple UPDATE)
    await pool.request()
      .input('Email', sql.VarChar, email)
      .input('Password', sql.VarChar, hashedPassword)
      .execute('COTIZ.sp_UserCrearPassword');

    return {
      respuesta: 'Exitoso',
      justificacion: 'Contraseña actualizada correctamente'
    };
  }

  async createPassword(email, password, token) {
    const pool = await getConnection();

    // 1. Verificar si el usuario existe y si ya tiene contraseña
    const checkUser = await pool.request()
      .input('Email', sql.VarChar, email)
      .query('SELECT password FROM [COTIZ].[USUARIOS] WHERE email = @Email');

    if (checkUser.recordset.length === 0) {
      const error = new Error('El usuario no existe.');
      error.status = 404;
      throw error;
    }

    const user = checkUser.recordset[0];
    if (user.password) {
      const error = new Error('USER_ALREADY_HAS_PASSWORD');
      error.status = 400;
      throw error;
    }

    // 2. Hashear la contraseña con bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Hashed password:', hashedPassword);
    // 3. Guardar en BD
    await pool.request()
      .input('Email', sql.VarChar, email)
      .input('Password', sql.VarChar, hashedPassword)
      .execute('COTIZ.sp_UserCrearPassword');

    return {
      respuesta: 'Exitoso',
      justificacion: 'Contraseña creada correctamente'
    };
  }
}

export default new AuthService();