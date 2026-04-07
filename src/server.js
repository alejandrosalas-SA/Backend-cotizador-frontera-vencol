import app from './app.js';
import { port, nodeEnv } from './config/index.js';
import { getConnection } from './database/connection.js';
import { iniciarJobAlerta, iniciarJobUrgente } from './jobs/alertas.job.js';

async function startServer() {
  try {
    // 1. Verificar conexión a Base de Datos antes de abrir puerto
    await getConnection();

    // 2. Iniciar servidor Express
    // NOTA DE SEGURIDAD: En producción, se recomienda usar HTTPS.
    // Usualmente esto se maneja a nivel de infraestructura (Nginx, AWS Load Balancer, Azure App Service)
    // por lo que Express escucha en HTTP plano internamente.
    app.listen(port, () => {
      console.log(`🛡️  Servidor Seguro corriendo en puerto: ${port} 🛡️`);
      console.log(`🔧 Ambiente: ${nodeEnv}`);

      // Iniciar jobs de alertas por email
      iniciarJobAlerta();
      iniciarJobUrgente();
    });

  } catch (error) {
    console.error('Fatal Error: No se pudo iniciar el servidor', error);
    process.exit(1);
  }
}

startServer();