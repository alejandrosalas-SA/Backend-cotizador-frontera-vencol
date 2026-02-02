// src/api/routes/maestros.routes.js
import { Router } from 'express';
import MaestrosController from '../controllers/maestros.controller.js';

const router = Router();

// 3er Grupo de EndPoints: Maestros
router.get('/Sucursales', MaestrosController.getSucursales);
router.get('/DuracionViaje', MaestrosController.getDuracionViaje);
router.get('/TipoExceso', MaestrosController.getTipoExceso); 
router.get('/TipoTransporte', MaestrosController.getTipoTransporte);
router.get('/TasacionEspecial', MaestrosController.getTasacionEspecial);

export default router;