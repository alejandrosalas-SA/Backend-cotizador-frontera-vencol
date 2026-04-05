import { Router } from 'express';
import EstadisticasController from '../controllers/estadisticas.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/mini-panel', verifyToken, EstadisticasController.getMiniPanel);
router.get('/dashboard', verifyToken, isAdmin, EstadisticasController.getDashboard);

export default router;
