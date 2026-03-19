import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import authValidator from '../validators/auth.validator.js';

const router = Router();

// Aplicamos el validador ANTES del controlador
router.post('/Login', authValidator.loginValidator, authController.login);

router.post('/ChangePassword', authValidator.changePasswordValidator, authController.changePassword);

router.post('/CreatePassword', authValidator.createPasswordValidator, authController.createPassword);

export default router;