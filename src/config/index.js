
import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 3000;
export const nodeEnv = process.env.NODE_ENV || 'development';
export const apiPrefix = '/api';
export const db = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    authentication: {
        type: 'ntlm',
        options: {
            userName: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            domain: process.env.DB_DOMAIN
        }
    },
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};