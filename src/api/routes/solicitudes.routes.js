import { Router } from 'express';
import SolicitudesController from '../controllers/solicitudes.controller.js';
// Aquí deberías importar validadores si usas express-validator

const router = Router();

// POST /api/v1/Solicitudes/Crear - Guarda la solicitud completa
router.post('/Crear', SolicitudesController.crear);

// GET /api/v1/Solicitudes - Lista solicitudes con filtros
router.get('/', SolicitudesController.listar);

// GET /api/v1/Solicitudes/:id - Ver detalle completo
router.get('/:id', SolicitudesController.obtenerDetalle);

// PUT /api/v1/Solicitudes/:id/Status - Cambiar a Procesada/Anulada
router.put('/:id/Status', SolicitudesController.cambiarStatus);

export default router;