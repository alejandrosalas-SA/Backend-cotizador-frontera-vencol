import { Router } from 'express';
import MaestrosController from '../controllers/maestros.controller.js';

const router = Router();

// EndPoints existentes para maestros
router.get('/Sucursales', MaestrosController.getSucursales);
router.get('/DuracionViaje', MaestrosController.getDuracionViaje);
router.get('/TipoExceso', MaestrosController.getTipoExceso); 
router.get('/TipoTransporte', MaestrosController.getTipoTransporte);
router.get('/TasacionEspecial', MaestrosController.getTasacionEspecial);
router.get('/Intermediarios', MaestrosController.getIntermediarios);
// EndPoints para soportar la vista de vehículos
router.get('/Marcas', MaestrosController.getMarcas);
router.get('/Modelos/:codMarca', MaestrosController.getModelos);

export default router;