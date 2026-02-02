import express, { json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { apiPrefix, nodeEnv } from './config/index.js';
import routes from './api/routes/index.js';

const app = express();

// 1. SEGURIDAD: Helmet (Protección de cabeceras HTTP)
app.use(helmet());

// 2. SEGURIDAD: Rate Limiting (Protección contra fuerza bruta/DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Límite de 1000 peticiones por IP
  message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos.'
});
app.use(limiter);

// 3. Middlewares Estándar
app.use(cors()); // Configurar dominios permitidos en producción
app.use(json({ limit: '10kb' })); // Limitar tamaño del body para evitar DoS
app.use(morgan('dev')); // Logging

// Rutas
app.use(apiPrefix, routes);

// Manejo de Error 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

// 4. Manejo de Errores Centralizado (No revelar Stack Trace en Producción)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log interno siempre
  
  const status = err.status || 500;
  const message = nodeEnv === 'production' && status === 500 
    ? 'Error interno del servidor' 
    : err.message;

  res.status(status).json({
    error: {
      message: message,
      // Solo enviamos stack trace si NO estamos en producción
      stack: nodeEnv === 'development' ? err.stack : undefined
    }
  });
});

export default app;