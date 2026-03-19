import { Router } from 'express';
import SolicitudesController from '../controllers/solicitudes.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/Solicitudes/Crear - Guarda la solicitud completa
router.post('/Crear', verifyToken, SolicitudesController.crear);

// GET /api/Solicitudes - Lista solicitudes (propias o todas si admin)
router.get('/', verifyToken, SolicitudesController.listar);

// GET /api/Solicitudes/:id - Ver detalle completo
router.get('/:id', verifyToken, SolicitudesController.obtenerDetalle);

// PUT /api/Solicitudes/:id - Actualizar status/condiciones/observaciones del borrador
router.put('/:id', verifyToken, SolicitudesController.actualizar);

// DELETE /api/Solicitudes/:id - Eliminar solicitud en cascada
router.delete('/:id', verifyToken, SolicitudesController.eliminar);

// PUT /api/Solicitudes/:id/Status - Cambiar a Procesada/Anulada (admin)
router.put('/:id/Status', verifyToken, isAdmin, SolicitudesController.cambiarStatus);

export default router;