
import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 3000;
export const nodeEnv = process.env.NODE_ENV || 'development';
export const apiPrefix = '/api';
export const db = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false, // Cambiar a true si usas Azure
        trustServerCertificate: true // Solo para desarrollo
    }
};