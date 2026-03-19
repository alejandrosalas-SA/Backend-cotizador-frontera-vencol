import { Router } from 'express';
import CotizacionController from '../controllers/cotizacion.controller.js';

const router = Router();

// Endpoint para cálculo dinámico
router.post('/calcular', CotizacionController.calcular);

export default router;
