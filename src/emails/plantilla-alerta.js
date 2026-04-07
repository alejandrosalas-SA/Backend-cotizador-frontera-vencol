/**
 * plantilla-alerta.js
 * Template de email para alertas de borradores con 7+ días.
 * Asunto: "Cotizaciones que se deben concretar"
 *
 * Usa React.createElement (sin JSX) para compatibilidad con ESM puro sin build step.
 * Las imágenes se referencian con CID (adjuntos de nodemailer).
 */

import React from 'react';
import { Html, Head, Body, Container, Section, Img, Text, Heading, Hr, Row, Column, Preview } from '@react-email/components';
import { render } from '@react-email/render';

// ─── Paleta ──────────────────────────────────────────────────────────────────
const C = {
  azul:        '#003366',
  rojo:        '#dc2626',
  amarillo:    '#eab308',
  blanco:      '#FFFFFF',
  textoOscuro: '#1e293b',
  textoGris:   '#64748b',
  fondo:       '#f1f5f9',
};

// ─── Estilos reutilizables ───────────────────────────────────────────────────
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
  tableContainer: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '24px',
    fontSize: '13px',
  },
  thCell: {
    backgroundColor: C.azul,
    color: C.blanco,
    padding: '10px 12px',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: `2px solid ${C.azul}`,
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
  badgePendiente: {
    backgroundColor: '#fef9c3',
    color: '#854d0e',
    border: '1px solid #eab308',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block',
    whiteSpace: 'nowrap',
  },
  badgeUrgente: {
    backgroundColor: '#fee2e2',
    color: C.rojo,
    border: `1px solid ${C.rojo}`,
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
    whiteSpace: 'nowrap',
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
  const esUrgente = solicitud.dias_transcurridos >= 12;
  const celdaBase = indice % 2 === 0 ? s.tdCell : s.tdCellAlt;

  const badge = esUrgente
    ? React.createElement('span', { style: s.badgeUrgente }, '⚠ URGENTE')
    : React.createElement('span', { style: s.badgePendiente }, 'Pendiente');

  return React.createElement('tr', { key: solicitud.id_solicitud },
    React.createElement('td', { style: celdaBase }, `#${solicitud.id_solicitud}`),
    React.createElement('td', { style: celdaBase }, solicitud.solicitante_nombre),
    React.createElement('td', { style: celdaBase }, solicitud.vehiculo_placa),
    React.createElement('td', { style: { ...celdaBase, textAlign: 'center' } },
      `${solicitud.dias_transcurridos} día${solicitud.dias_transcurridos !== 1 ? 's' : ''}`
    ),
    React.createElement('td', { style: { ...celdaBase, textAlign: 'center' } }, badge),
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
function PlantillaAlerta({ empleado, solicitudes }) {
  const nombre = empleado?.nombre_empleado ?? empleado?.nombre ?? 'Estimado colaborador';
  const hayUrgentes = solicitudes.some(s => s.dias_transcurridos >= 12);

  return React.createElement(Html, { lang: 'es' },
    React.createElement(Head, null),
    React.createElement(Preview, null,
      `Tienes ${solicitudes.length} cotización(es) pendiente(s) de concretar. Por favor revísalas.`
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

        // ── Contenido ──
        React.createElement(Section, { style: s.content },
          React.createElement(Text, { style: s.saludo }, `Hola, ${nombre}`),

          React.createElement(Text, { style: s.parrafo },
            'Te informamos que tienes solicitudes de cotización en estado borrador que llevan varios días ' +
            'sin concretarse. Por favor, comunícate con el cliente correspondiente para avanzar con el ' +
            'proceso y lograr emitir la póliza.'
          ),

          hayUrgentes && React.createElement(Text, {
            style: {
              ...s.parrafo,
              color: C.rojo,
              fontWeight: '600',
              backgroundColor: '#fee2e2',
              border: `1px solid ${C.rojo}`,
              borderRadius: '6px',
              padding: '10px 14px',
            },
          },
            '⚠ Algunas de estas solicitudes ya superan los 12 días y deben atenderse con urgencia. ' +
            'Vencen automáticamente al día 15.'
          ),

          // ── Tabla ──
          React.createElement('table', { style: s.tableContainer, cellPadding: '0', cellSpacing: '0' },
            React.createElement('thead', null,
              React.createElement('tr', null,
                React.createElement('th', { style: s.thCell }, '#'),
                React.createElement('th', { style: s.thCell }, 'Solicitante'),
                React.createElement('th', { style: s.thCell }, 'Placa'),
                React.createElement('th', { style: { ...s.thCell, textAlign: 'center' } }, 'Días'),
                React.createElement('th', { style: { ...s.thCell, textAlign: 'center' } }, 'Estado'),
              )
            ),
            React.createElement('tbody', null,
              ...solicitudes.map((sol, i) => filaTabla(sol, i))
            )
          ),

          // ── Imagen operadora ──
          React.createElement(Img, {
            src: 'cid:operadora',
            alt: 'Operadora',
            style: s.imgCentrada,
          }),

          React.createElement(Hr, { style: s.hr }),

          React.createElement(Text, { style: s.recordatorio },
            'Por favor no olvides gestionar estas cotizaciones. ¡Tu gestión hace la diferencia!'
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
export async function renderAlerta({ empleado, solicitudes }) {
  return render(React.createElement(PlantillaAlerta, { empleado, solicitudes }));
}

export const asuntoAlerta = 'Cotizaciones que se deben concretar';
