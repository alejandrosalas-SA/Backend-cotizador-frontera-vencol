import { validationResult } from 'express-validator';

// Middleware genérico para capturar errores de express-validator
// Esto "Desinfecta la entrada" y responde con 400 antes de llegar al controlador
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Error de validación',
      details: errors.array() 
    });
  }
  next();
};

export default validateResults;