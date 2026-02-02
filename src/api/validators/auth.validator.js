import { body } from 'express-validator';
import validateResults from '../middlewares/validation.middleware.js';

// Reglas de validación para Auth
const loginValidator = [
  body('Email')
    .exists().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(), // Sanitización
  body('Password')
    .exists().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validateResults // Middleware que verifica las reglas anteriores
];

const changePasswordValidator = [
  body('Email').isEmail(),
  body('PasswordOld').exists().notEmpty(),
  body('PasswordNew')
    .isLength({ min: 8 }).withMessage('La nueva contraseña debe ser segura (mínimo 8 caracteres)')
    // Validación personalizada: No puede ser igual a la anterior
    .custom((value, { req }) => {
      if (value === req.body.PasswordOld) {
        throw new Error('La nueva contraseña no puede ser igual a la anterior');
      }
      return true;
    }),
  validateResults
];

export default { loginValidator, changePasswordValidator };