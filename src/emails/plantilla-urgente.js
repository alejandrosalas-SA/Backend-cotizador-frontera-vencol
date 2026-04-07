/**
 * plantilla-urgente.js
 * Template de email para alertas URGENTES de borradores con 12+ días.
 * Asunto: "URGENTE: Se van a vencer estas cotizaciones"
 *
 * Usa React.createElement (sin JSX) para compatibilidad con ESM puro sin build step.
 * Las imágenes se referencian con CID (adjuntos de nodemailer).
 */

import React from 'react';
import { Html, Head, Body, Container, Section, Img, Text, Hr, Preview } from '@react-email/components';
import { render } from '@react-email/render';

// ─── Paleta ──────────────────────────────────────────────────────────────────
const C = {
  azul:        '#003366',
  rojo:        '#dc2626',
  rojoFondo:   '#fee2e2',
  blanco:      '#FFFFFF',
  textoOscuro: '#1e293b',
  textoGris:   '#64748b',
  fondo:       '#f1f5f9',
};

// ─── Estilos ─────────────────────────────────────────────────────────────────
const s = {
  body: {
    backgroundColor: C.fondo,
    fontFamily: "'Segoe UI', Arial, sans-serif",
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: C.blanco,
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  header: {
    backgroundColor: C.azul,
    padding: '28px 24px',
    textAlign: 'center',
  },
  headerTitle: {
    color: C.blanco,
    fontSize: '18px',
    fontWeight: '700',
    margin: '12px 0 0 0',
    letterSpacing: '0.5px',
  },
  bannerUrgente: {
    backgroundColor: C.rojo,
    color: C.blanco,
    textAlign: 'center',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  content: {
    padding: '28px 32px',
    color: C.textoOscuro,
  },
  saludo: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: C.textoOscuro,
  },
  parrafo: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: C.textoOscuro,
    marginBottom: '20px',
  },
  parrafoAlerta: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: C.rojo,
    fontWeight: '600',
    backgroundColor: C.rojoFondo,
    border: `1px solid ${C.rojo}`,
    borderRadius: '6px',
    padding: '12px 16px',
    marginBottom: '20px',
  },
  tableContainer: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '24px',
    fontSize: '13px',
  },
  thCell: {
    backgroundColor: C.rojo,
    color: C.blanco,
    padding: '10px 12px',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: `2px solid ${C.rojo}`,
  },
  tdCell: {
    padding: '9px 12px',
    borderBottom: '1px solid #e2e8f0',
    color: C.textoOscuro,
    verticalAlign: 'top',
  },
  tdCellAlt: {
    padding: '9px 12px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: C.textoOscuro,
    verticalAlign: 'top',
  },
  diasRestantesOk: {
    color: '#854d0e',
    fontWeight: '700',
    textAlign: 'center',
  },
  diasRestantesCritico: {
    color: C.rojo,
    fontWeight: '700',
    textAlign: 'center',
  },
  imgCentrada: {
    display: 'block',
    margin: '0 auto 24px auto',
    maxWidth: '400px',
    width: '100%',
    borderRadius: '6px',
  },
  recordatorio: {
    fontSize: '13px',
    fontStyle: 'italic',
    color: C.textoGris,
    textAlign: 'center',
    marginTop: '8px',
    marginBottom: '16px',
  },
  footer: {
    backgroundColor: C.azul,
    padding: '0',
    overflow: 'hidden',
  },
  footerImg: {
    display: 'block',
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    objectPosition: 'center',
  },
  footerTexto: {
    backgroundColor: C.azul,
    color: 'rgba(255,255,255,0.6)',
    fontSize: '11px',
    textAlign: 'center',
    padding: '8px 16px 12px',
    margin: 0,
  },
  hr: {
    borderColor: '#e2e8f0',
    margin: '0 0 20px 0',
  },
};

// ─── Función auxiliar: fila de tabla ────────────────────────────────────────
function filaTabla(solicitud, indice) {
  const diasRestantes = 15 - solicitud.dias_transcurridos;
  const esCritico = diasRestantes <= 3;
  const celdaBase = indice % 2 === 0 ? s.tdCell : s.tdCellAlt;
  const estiloDias = esCritico ? s.diasRestantesCritico : s.diasRestantesOk;

  return React.createElement('tr', { key: solicitud.id_solicitud },
    React.createElement('td', { style: celdaBase }, `#${solicitud.id_solicitud}`),
    React.createElement('td', { style: celdaBase }, solicitud.solicitante_nombre),
    React.createElement('td', { style: celdaBase }, solicitud.vehiculo_placa),
    React.createElement('td', { style: { ...celdaBase, textAlign: 'center' } },
      `${solicitud.dias_transcurridos} día${solicitud.dias_transcurridos !== 1 ? 's' : ''}`
    ),
    React.createElement('td', { style: { ...celdaBase, ...estiloDias } },
      diasRestantes <= 0
        ? 'Vence hoy'
        : `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`
    ),
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
function PlantillaUrgente({ empleado, solicitudes }) {
  const nombre = empleado?.nombre_empleado ?? empleado?.nombre ?? 'Estimado colaborador';

  return React.createElement(Html, { lang: 'es' },
    React.createElement(Head, null),
    React.createElement(Preview, null,
      `URGENTE: ${solicitudes.length} cotización(es) a punto de vencerse. Actúa hoy.`
    ),
    React.createElement(Body, { style: s.body },
      React.createElement(Container, { style: s.container },

        // ── Header ──
        React.createElement(Section, { style: s.header },
          React.createElement(Img, {
            src: 'cid:logo-cotizador',
            alt: 'Cotizador Altamira',
            width: '64',
            height: '64',
            style: { display: 'block', margin: '0 auto' },
          }),
          React.createElement(Text, { style: s.headerTitle }, 'Cotizador Altamira Seguros'),
        ),

        // ── Banner urgente ──
        React.createElement(Section, { style: s.bannerUrgente },
          '⚠  ACCIÓN REQUERIDA — COTIZACIONES A PUNTO DE VENCERSE  ⚠'
        ),

        // ── Contenido ──
        React.createElement(Section, { style: s.content },
          React.createElement(Text, { style: s.saludo }, `Hola, ${nombre}`),

          React.createElement(Text, { style: s.parrafoAlerta },
            'Las siguientes solicitudes llevan 12 o más días en estado borrador y vencerán ' +
            'automáticamente al día 15. Una vez vencidas, ya no podrás procesarlas. ' +
            'Por favor, contacta con urgencia al cliente para concretar cada cotización.'
          ),

          // ── Tabla ──
          React.createElement('table', { style: s.tableContainer, cellPadding: '0', cellSpacing: '0' },
            React.createElement('thead', null,
              React.createElement('tr', null,
                React.createElement('th', { style: s.thCell }, '#'),
                React.createElement('th', { style: s.thCell }, 'Solicitante'),
                React.createElement('th', { style: s.thCell }, 'Placa'),
                React.createElement('th', { style: { ...s.thCell, textAlign: 'center' } }, 'Días'),
                React.createElement('th', { style: { ...s.thCell, textAlign: 'center' } }, 'Días restantes'),
              )
            ),
            React.createElement('tbody', null,
              ...solicitudes.map((sol, i) => filaTabla(sol, i))
            )
          ),

          // ── Imagen de alerta ──
          React.createElement(Img, {
            src: 'cid:alerta-img',
            alt: 'Alerta',
            style: s.imgCentrada,
          }),

          React.createElement(Hr, { style: s.hr }),

          React.createElement(Text, { style: s.recordatorio },
            '¡No lo olvides! Habla hoy con el cliente y concreta la cotización antes de que venza.'
          ),
        ),

        // ── Footer ──
        React.createElement(Section, { style: s.footer },
          React.createElement(Img, {
            src: 'cid:footer-img',
            alt: 'Altamira Seguros',
            style: s.footerImg,
          }),
          React.createElement(Text, { style: s.footerTexto },
            `© ${new Date().getFullYear()} Altamira Seguros. Todos los derechos reservados.`
          ),
        ),
      )
    )
  );
}

// ─── Función exportada para uso en el job ───────────────────────────────────
/**
 * @param {{ empleado: object, solicitudes: object[] }} params
 * @returns {Promise<string>} HTML del email listo para enviar
 */
export async function renderUrgente({ empleado, solicitudes }) {
  return render(React.createElement(PlantillaUrgente, { empleado, solicitudes }));
}

export const asuntoUrgente = 'URGENTE: Se van a vencer estas cotizaciones';
