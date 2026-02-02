// src/api/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import maestrosRoutes from './maestros.routes.js';
import coberturasRoutes from './coberturas.routes.js';

const router = Router();

// Agrupamos las rutas
router.use('/User', authRoutes);           // Para Login y ChangePassword
router.use('/Maestros', maestrosRoutes);   // Para Sucursales, Tipos, etc.
router.use('/Coberturas', coberturasRoutes); // Para cotizaciones

export default router;