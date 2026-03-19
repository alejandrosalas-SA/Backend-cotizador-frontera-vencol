import sql from 'mssql';
const { connect } = sql;
import { db } from '../config/index.js';

// Patrón Singleton para el Pool de Conexión
let pool = null;

const getConnection = async () => {
  try {
    if (pool) return pool;

    pool = await connect(db);
    console.log('✅ Conectado a Microsoft SQL Server');
    return pool;
  } catch (error) {
    console.error('❌ Error de conexión a Base de Datos:', error);
    throw error;
  }
};

export { getConnection, sql };