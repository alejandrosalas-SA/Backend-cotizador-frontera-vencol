
# 🚛 Backend Cotizador de Transporte (Colombia-Venezuela)

API RESTful para la gestión y cotización de pólizas de seguro de transporte transfronterizo.  
Desarrollado para **Seguros Altamira**.

---
Versión: 1.0.0
## 📖 Descripción

Este proyecto constituye el núcleo transaccional (Backend) del sistema de cotización. Actúa como una capa de seguridad e interfaz validada entre la aplicación web y la lógica de negocio almacenada en **Microsoft SQL Server**.

Implementa una **arquitectura de 3 capas** optimizada para entornos corporativos (Intranet), priorizando:

- Integridad de los datos  
- Seguridad en la transmisión  
- Alto rendimiento mediante delegación a Stored Procedures  

---

## 🏗️ Arquitectura del Proyecto

El código sigue el principio **Separation of Concerns (SoC)** y el patrón **Thin Backend / Smart Database**:

```

src/
├── api/             # 1. Capa de Presentación (HTTP)
│   ├── routes/      # Definición de endpoints
│   ├── controllers/ # Orquestación (Request -> Servicio -> Response)
│   ├── validators/  # Reglas de validación de entrada (Sanitización)
│   └── middlewares/ # Seguridad (Rate Limiting, Helmet, Error Handling)
├── services/        # 2. Capa de Servicio (Lógica de Aplicación)
│   └── \*.service.js # Comunicación con la BD (Ejecución de SPs)
├── database/        # 3. Capa de Datos
│   └── connection.js# Configuración del Pool SQL Server
└── config/          # Variables de entorno y constantes

````

---

## 🧩 Principios de Diseño

### ✔️ Validación en Capas

**Backend (Node.js):**
- Validación de tipos de datos  
- Formatos (email, strings vacíos)  
- Estructura de la petición  

**Base de Datos (SQL Server):**
- Reglas de negocio complejas  
- Integridad referencial  
- Cálculo matemático de primas  

### ✔️ Seguridad

- Ocultamiento de detalles del servidor en producción  
- Protección ante ataques comunes (DDoS, XSS, Sniffing)  

---

## 🛠️ Tecnologías Clave

- **Runtime:** Node.js + Express.js  
- **Base de Datos:** `mssql` (Driver oficial SQL Server)  
- **Seguridad:** `helmet`, `cors`, `express-rate-limit`  
- **Validación:** `express-validator`  
- **Utilidades:** `dotenv`, `morgan`  

---

## ⚙️ Instalación y Despliegue

### **Prerrequisitos**
- Node.js v16 o superior  
- Acceso a instancia SQL Server  

### **1. Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd cotizador-altamira-backend
````

### **2. Instalar dependencias**

```bash
npm install
```

### **3. Crear archivo `.env`**

    PORT=3000
    NODE_ENV=development

    # Credenciales de Base de Datos
    DB_USER=sa
    DB_PASSWORD=TuPasswordSeguro
    DB_SERVER=192.168.1.XX
    DB_NAME=SegurosAltamiraDB

### **4. Ejecutar servidor**

```bash
npm run dev  # Modo Desarrollo
npm start    # Modo Producción
```

***

## 🗄️ Requisitos de Base de Datos

El backend depende de los siguientes **Stored Procedures**:

| Stored Procedure       | Parámetros                             | Descripción                 |
| ---------------------- | -------------------------------------- | --------------------------- |
| sp\_UserLogin          | @Email, @Password                      | Autenticación de usuarios   |
| sp\_UserChangePassword | @Email, @OldPass, @NewPass             | Cambio de contraseña        |
| sp\_GetSucursales      | -                                      | Lista de sucursales         |
| sp\_GetTipoTransporte  | -                                      | Lista de tipos de vehículos |
| sp\_CotizarBasica      | @IdTipoTransporte, @IdDuracion         | Calcula prima base          |
| sp\_CotizarExceso      | @IdTipoTransporte, @IdDuracion, @IdAlt | Calcula excesos             |
| sp\_CotizarOpcional    | @Params                                | Coberturas opcionales       |

***

## 📡 Documentación de API (Endpoints)

**Prefijo global:** `/api/v1`

### 👤 Autenticación (`/User`)

*   **POST /Login** — Inicio de sesión
*   **POST /ChangePassword** — Cambio de clave

### 📋 Maestros (`/Maestros`)

*   **GET** `/Sucursales`
*   **GET** `/DuracionViaje`
*   **GET** `/TipoExceso`
*   **GET** `/TipoTransporte`
*   **GET** `/TasacionEspecial`

### 💰 Cotización (`/Coberturas`)

*   **POST /Basica**
*   **POST /Exceso**
*   **POST /Opcional**
*   **POST /Total**

***

## 🔒 Seguridad Implementada

*   **Rate Limiting:** 100 solicitudes / 15 min por IP
*   **Sanitización:** Prevención de inyección básica
*   **Encabezados seguros:** Helmet
*   **Errores:** En producción no se expone Stack Trace

***

## 🤝 Flujo de Trabajo (Git)

*   🔴 **main:** Producción (Stable)
*   🟡 **develop:** Integración y pruebas
*   🔵 **feature/\***: Desarrollo local

***

© 2026 **Seguros Altamira - Departamento de Tecnología**
