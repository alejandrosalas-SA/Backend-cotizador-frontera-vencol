import { Router } from 'express';
import coberturasController from '../controllers/coberturas.controller.js';

const router = Router();

// 4to Grupo de EndPoints: Cotización de Coberturas
router.post('/Basica', coberturasController.cotizarBasica);
router.post('/Exceso', coberturasController.cotizarExceso);
router.post('/Opcional', coberturasController.cotizarOpcional);
router.post('/Total', coberturasController.cotizarTotal);

export default router;