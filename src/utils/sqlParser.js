/**
 * Utilidad para procesar resultados de SQL Server.
 * Maneja especialmente la salida de 'FOR JSON PATH', que mssql entrega
 * en una columna con prefijo 'JSON_'.
 */
export const parseSqlJson = (record) => {
    if (!record) return null;

    // Buscar la clave que empieza por 'JSON_'
    const jsonKey = Object.keys(record).find(key => key.startsWith('JSON_'));

    if (jsonKey && typeof record[jsonKey] === 'string') {
        try {
            const parsed = JSON.parse(record[jsonKey]);
            // FOR JSON PATH suele devolver un array, extraemos el primer elemento si es el caso
            return Array.isArray(parsed) ? parsed[0] : parsed;
        } catch (e) {
            console.error('Error parseando JSON de SQL Server:', e);
            return record; // Devolver el original si falla el parseo
        }
    }

    return record;
};
