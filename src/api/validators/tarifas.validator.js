import { body, param } from 'express-validator';
import validateResults from '../middlewares/validation.middleware.js';

const updateTarifaValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
  body('prima')
    .exists().withMessage('El campo prima es requerido')
    .isFloat({ min: 0 }).withMessage('La prima debe ser un número mayor o igual a 0'),
  validateResults
];

const updateSumaAseguradaValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
  body('valor')
    .exists().withMessage('El campo valor es requerido')
    .isFloat({ min: 0 }).withMessage('El valor debe ser un número mayor o igual a 0'),
  validateResults
];

const updateTasaOpcionalValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
  body('tasa')
    .exists().withMessage('El campo tasa es requerido')
    .isFloat({ min: 0 }).withMessage('La tasa debe ser un número mayor o igual a 0'),
  validateResults
];

export default { updateTarifaValidator, updateSumaAseguradaValidator, updateTasaOpcionalValidator };