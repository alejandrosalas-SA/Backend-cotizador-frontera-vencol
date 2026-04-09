/**
 * preview-emails.js
 * Genera los HTML de los dos emails y los guarda en /preview/
 * Uso: node preview-emails.js
 * Luego abre preview/alerta.html y preview/urgente.html en el navegador.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderAlerta } from './src/emails/plantilla-alerta.js';
import { renderUrgente } from './src/emails/plantilla-urgente.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'preview');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// ── Datos de prueba ──────────────────────────────────────────────────────────
const empleado = {
  cod_emp: 'EMP001',
  email: 'alejandro.salas@segurosaltamira.com',
  nombre_empleado: 'Alejandro Salas',
};

const solicitudes = [
  { id_solicitud: 101, solicitante_nombre: 'Carlos Pérez',   vehiculo_placa: 'ABC-123', dias_transcurridos: 8  },
  { id_solicitud: 102, solicitante_nombre: 'María González', vehiculo_placa: 'XYZ-789', dias_transcurridos: 13 },
  { id_solicitud: 103, solicitante_nombre: 'Luis Ramírez',   vehiculo_placa: 'DEF-456', dias_transcurridos: 7  },
];

const solicitudesUrgentes = solicitudes.filter(s => s.dias_transcurridos >= 12);

// ── Generar y guardar ────────────────────────────────────────────────────────
const htmlAlerta  = await renderAlerta({ empleado, solicitudes });
const htmlUrgente = await renderUrgente({ empleado, solicitudes: solicitudesUrgentes });

const alertaPath  = path.join(outDir, 'alerta.html');
const urgentePath = path.join(outDir, 'urgente.html');

fs.writeFileSync(alertaPath,  htmlAlerta);
fs.writeFileSync(urgentePath, htmlUrgente);

console.log(`✅ Previews generados:`);
console.log(`   ${alertaPath}`);
console.log(`   ${urgentePath}`);
console.log(`\nAbre esos archivos en tu navegador para visualizar los emails.`);
