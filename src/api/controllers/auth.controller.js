// src/api/controllers/auth.controller.js
import authService from '../../services/auth.service.js';

class AuthController {
  
  async login(req, res, next) {
    try {
      const { Email, Password } = req.body;
      // Llamada al servicio
      const result = await authService.login(Email, Password);
      res.status(200).json(result);
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
}

export default new AuthController();