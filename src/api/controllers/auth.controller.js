
// src/api/controllers/auth.controller.js
import authService from '../../services/auth.service.js';
import jwt from 'jsonwebtoken';

class AuthController {

  async login(req, res, next) {
    try {
      const { Email, Password } = req.body;
      // Llamada al servicio
      const user = await authService.login(Email, Password);

      // Generar Token
      // Mapeamos los campos que vienen del SP sp_UserLogin (cod_emp, id_rol, email, etc.)
      const tokenPayload = {
        id: user.cod_emp, // Usamos cod_emp como identificador único
        role: user.id_rol,
        email: user.email
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'secret-development-key',
        { expiresIn: '8h' }
      );

      res.status(200).json({
        user,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { Email, PasswordOld, PasswordNew } = req.body;
      const result = await authService.changePassword(Email, PasswordOld, PasswordNew);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createPassword(req, res, next) {
    try {
      const { Email, Password, Token } = req.body;
      const result = await authService.createPassword(Email, Password, Token);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();