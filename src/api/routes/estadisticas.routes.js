import { Router } from 'express';
import EstadisticasController from '../controllers/estadisticas.controller.js';
import { verifyToken, isAdmin, isSupervisorOrAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Mini-panel: cualquier usuario autenticado (se usa en el dashboard)
router.get('/mini-panel', verifyToken, EstadisticasController.getMiniPanel);

// Dashboard completo: admin (global o filtrado por sucursal) y supervisor (sus sucursales)
router.get('/dashboard', verifyToken, isSupervisorOrAdmin, EstadisticasController.getDashboard);

export default router;
