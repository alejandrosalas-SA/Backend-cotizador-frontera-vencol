/**
 * alertas.job.js
 * Cron jobs para el sistema de alertas de borradores vencidos.
 *
 * JOB 1 — iniciarJobAlerta():
 *   Horario: Lunes, Miércoles y Viernes a las 8:00 am  (0 8 * * 1,3,5)
 *   Acción:  Envía email a cada empleado con sus borradores de 7+ días.
 *
 * JOB 2 — iniciarJobUrgente():
 *   Horario: Todos los días a las 7:00 am  (0 7 * * *)
 *   Acción:  1) Expira borradores de 15+ días (status=3).
 *            2) Envía email urgente a empleados con borradores de 12+ días.
 */

import cron from 'node-cron';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

import alertasService from '../services/alertas.service.js';
import { renderAlerta, asuntoAlerta } from '../emails/plantilla-alerta.js';
import { renderUrgente, asuntoUrgente } from '../emails/plantilla-urgente.js';
import { emailConfig } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const assetsDir  = path.resolve(__dirname, '../../assets');

// ─── Attachments (imágenes embebidas por CID) ────────────────────────────────
const attachmentsBase = [
  {
    filename: 'logo.png',
    path: path.join(assetsDir, 'Logos-Seguros-Altamira', 'icono-cotizador.png'),
    cid: 'logo-cotizador',
  },
  {
    filename: 'footer.png',
    path: path.join(assetsDir, 'imagen-principal-cotizacion-transporte-binacional.png'),
    cid: 'footer-img',
  },
];

const attachmentsAlerta = [
  ...attachmentsBase,
  {
    filename: 'operadora.png',
    path: path.join(assetsDir, 'templates', 'operadora.png'),
    cid: 'operadora',
  },
];

const attachmentsUrgente = [
  ...attachmentsBase,
  {
    filename: 'alerta.png',
    path: path.join(assetsDir, 'templates', 'alerta.png'),
    cid: 'alerta-img',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Crea un transporter de nodemailer con la config del .env */
function crearTransporter() {
  return nodemailer.createTransport({
    host:   emailConfig.host,
    port:   emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.auth.user,
      pass: emailConfig.auth.pass,
    },
  });
}

/**
 * Agrupa un array plano de filas (una por solicitud) en un mapa
 * indexado por cod_emp. Cada entrada tiene { empleado, solicitudes[] }.
 */
function agruparPorEmpleado(rows) {
  const mapa = new Map();
  for (const row of rows) {
    if (!mapa.has(row.cod_emp)) {
      mapa.set(row.cod_emp, {
        empleado: {
          cod_emp:         row.cod_emp,
          email:           row.email,
          nombre_empleado: row.nombre_empleado,
        },
        solicitudes: [],
      });
    }
    mapa.get(row.cod_emp).solicitudes.push({
      id_solicitud:        row.id_solicitud,
      fecha_emision:       row.fecha_emision,
      dias_transcurridos:  row.dias_transcurridos,
      solicitante_nombre:  row.solicitante_nombre,
      vehiculo_placa:      row.vehiculo_placa,
    });
  }
  return [...mapa.values()];
}

// ─── Ejecuciones separadas (exportadas para pruebas manuales) ────────────────

/**
 * Envía alertas de 7+ días a todos los empleados que las tengan.
 * Llámalo directamente para probar sin esperar el cron.
 */
export async function ejecutarAlertaBorradores() {
  console.log('[alertas] Iniciando job: alerta borradores 7+ días...');
  try {
    const rows = await alertasService.getBorradoresPorEmpleado(7);
    if (rows.length === 0) {
      console.log('[alertas] Sin borradores de 7+ días. No se envían emails.');
      return;
    }

    const grupos = agruparPorEmpleado(rows);
    const transporter = crearTransporter();
    let enviados = 0;

    for (const { empleado, solicitudes } of grupos) {
      if (!empleado.email) {
        console.warn(`[alertas] Empleado ${empleado.cod_emp} sin email. Omitido.`);
        continue;
      }

      try {
        const html = await renderAlerta({ empleado, solicitudes });
        await transporter.sendMail({
          from:        emailConfig.from,
          to:          empleado.email,
          subject:     asuntoAlerta,
          html,
          attachments: attachmentsAlerta,
        });
        enviados++;
        console.log(`[alertas] Email enviado a ${empleado.email} (${solicitudes.length} borradores)`);
      } catch (err) {
        console.error(`[alertas] Error enviando a ${empleado.email}:`, err.message);
      }
    }

    console.log(`[alertas] Job finalizado. Emails enviados: ${enviados}/${grupos.length}`);
  } catch (err) {
    console.error('[alertas] Error en job alerta borradores:', err);
  }
}

/**
 * Expira borradores de 15+ días (status=3) y luego envía alertas urgentes
 * a empleados con borradores de 12+ días.
 * Llámalo directamente para probar sin esperar el cron.
 */
export async function ejecutarAlertaUrgente() {
  console.log('[alertas-urgente] Iniciando job: expirar 15d + alerta urgente 12d...');
  try {
    // 1. Expirar borradores vencidos (15+ días)
    const { solicitudes_expiradas } = await alertasService.expirarBorradoresVencidos();
    if (solicitudes_expiradas > 0) {
      console.log(`[alertas-urgente] ${solicitudes_expiradas} borrador(es) expirado(s) → status=3`);
    }

    // 2. Alertas urgentes (12+ días, los de 15+ ya fueron expirados)
    const rows = await alertasService.getBorradoresPorEmpleado(12);
    if (rows.length === 0) {
      console.log('[alertas-urgente] Sin borradores de 12+ días. No se envían emails urgentes.');
      return;
    }

    const grupos = agruparPorEmpleado(rows);
    const transporter = crearTransporter();
    let enviados = 0;

    for (const { empleado, solicitudes } of grupos) {
      if (!empleado.email) {
        console.warn(`[alertas-urgente] Empleado ${empleado.cod_emp} sin email. Omitido.`);
        continue;
      }

      try {
        const html = await renderUrgente({ empleado, solicitudes });
        await transporter.sendMail({
          from:        emailConfig.from,
          to:          empleado.email,
          subject:     asuntoUrgente,
          html,
          attachments: attachmentsUrgente,
        });
        enviados++;
        console.log(`[alertas-urgente] Email urgente enviado a ${empleado.email} (${solicitudes.length} borradores)`);
      } catch (err) {
        console.error(`[alertas-urgente] Error enviando a ${empleado.email}:`, err.message);
      }
    }

    console.log(`[alertas-urgente] Job finalizado. Emails enviados: ${enviados}/${grupos.length}`);
  } catch (err) {
    console.error('[alertas-urgente] Error en job urgente:', err);
  }
}

// ─── Registro de crons ───────────────────────────────────────────────────────

/**
 * Registra el cron de alertas regulares: Lun/Mié/Vie a las 8:00 am.
 */
export function iniciarJobAlerta() {
  cron.schedule('0 8 * * 1,3,5', ejecutarAlertaBorradores, {
    timezone: 'America/Caracas',
  });
  console.log('[alertas] Job alerta borradores registrado (Lun/Mié/Vie 8:00 am)');
}

/**
 * Registra el cron de alertas urgentes + auto-expiración: todos los días a las 7:00 am.
 */
export function iniciarJobUrgente() {
  cron.schedule('0 7 * * *', ejecutarAlertaUrgente, {
    timezone: 'America/Caracas',
  });
  console.log('[alertas] Job urgente + expiración registrado (diario 7:00 am)');
}
