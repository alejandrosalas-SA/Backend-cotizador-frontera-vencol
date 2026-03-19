import { Router } from 'express';
import TarifasController from '../controllers/tarifas.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import TarifasValidator from '../validators/tarifas.validator.js';

const router = Router();

router.get('/', verifyToken, isAdmin, TarifasController.getTarifas);
router.put('/:id', verifyToken, isAdmin, TarifasValidator.updateTarifaValidator, TarifasController.updateTarifa);

export default router;