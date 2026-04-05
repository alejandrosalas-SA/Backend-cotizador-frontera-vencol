import { Router } from 'express';
import MaestrosController from '../controllers/maestros.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import TarifasValidator from '../validators/tarifas.validator.js';

const router = Router();

// Listas Maestro
router.get('/Sucursales', MaestrosController.getSucursales);
router.get('/SucursalesUsuario/:codEmp', MaestrosController.getSucursalesUsuario);
router.get('/DuracionViaje', MaestrosController.getDuracionViaje);
router.get('/TipoExceso', MaestrosController.getTipoExceso);
router.get('/TipoTransporte', MaestrosController.getTipoTransporte);
router.get('/TasacionEspecial', MaestrosController.getTasacionEspecial);
router.get('/Intermediarios', MaestrosController.getIntermediarios); // Persona Autorizada para Cotizar
router.get('/DefinicionTerminos', MaestrosController.getDefinicionTerminos);
router.get('/RolesUsuarios', MaestrosController.getRolesUsuarios);
router.get('/SumasAseguradas', MaestrosController.getSumasAseguradas);
router.get('/SumasAseguradas/:tipoExceso', MaestrosController.getSumasAseguradas);

router.get('/VersionActual', MaestrosController.getVersionActual);

// Vehículos (via Vista COTIZ.VVEH_MARCA_MODELO)
router.get('/Marcas', MaestrosController.getMarcas);
router.get('/Modelos/:codMarca', MaestrosController.getModelos);

// Admin: actualizar suma asegurada (solo rol 1)
router.put('/SumasAseguradas/:id', verifyToken, isAdmin, TarifasValidator.updateSumaAseguradaValidator, MaestrosController.updateSumaAsegurada);

export default router;