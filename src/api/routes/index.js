import { Router } from 'express';
import authRoutes from './auth.routes.js';
import maestrosRoutes from './maestros.routes.js';
import coberturasRoutes from './coberturas.routes.js';
import solicitudesRoutes from './solicitudes.routes.js';
import cotizacionRoutes from './cotizacion.routes.js';
import tarifasRoutes from './tarifas.routes.js';

const router = Router();

// Agrupamos las rutas
router.use('/User', authRoutes);           // Para Login y ChangePassword
router.use('/Maestros', maestrosRoutes);   // Para Sucursales, Tipos, etc.
router.use('/Coberturas', coberturasRoutes); // Para cotizaciones
router.use('/Solicitudes', solicitudesRoutes); // Para manejar cotizaciones/emisiones
router.use('/Cotizacion', cotizacionRoutes); // Para calculo dinamico
router.use('/Tarifas', tarifasRoutes);     // Admin: gestión de primas y tarifas

export default router;