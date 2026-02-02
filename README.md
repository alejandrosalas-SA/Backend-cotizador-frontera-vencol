🚛 API Cotizador Seguros Altamira (Node.js + MSSQL)Backend seguro y escalable para el sistema de cotización de transporte Colombia-Venezuela. Conecta con SQL Server mediante Stored Procedures.🛡️ Características de Seguridad ImplementadasHelmet: Protección de cabeceras HTTP.Rate Limiting: Límite de 100 peticiones/15min por IP.Input Sanitization: Validación estricta con express-validator.SQL Injection Protection: Uso de parámetros tipados en Stored Procedures.Error Handling: Stack traces ocultos en producción.🗄️ Base de Datos (Stored Procedures)El sistema espera los siguientes Stored Procedures en SQL Server:sp_UserLogin (@Email, @Password)sp_UserChangePassword (@Email, @OldPass, @NewPass)sp_GetSucursalessp_CotizarBasica (...)🚀 ConfiguraciónCrear archivo .env en la raíz:PORT=3000
NODE_ENV=development
DB_USER=sa
DB_PASSWORD=TuPasswordSeguro123
DB_SERVER=localhost
DB_NAME=SegurosAltamiraDB
Instalar dependencias:npm install
Auditoría de seguridad (Opcional):npm audit fix
Ejecutar:npm run dev
