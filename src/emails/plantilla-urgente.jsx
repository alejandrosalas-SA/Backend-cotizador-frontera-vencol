/**
 * plantilla-urgente.jsx
 * Template de email para alertas URGENTES de borradores con 12+ días.
 * Asunto: "URGENTE: Se van a vencer estas cotizaciones"
 */

import React from 'react';
import { Html, Head, Body, Container, Section, Img, Text, Hr, Preview } from '@react-email/components';
import { render } from '@react-email/render';

// ─── Paleta ──────────────────────────────────────────────────────────────────
const C = {
  azul: '#003366',
  rojo: '#dc2626',
  rojoFondo: '#fee2e2',
  blanco: '#FFFFFF',
  textoOscuro: '#1e293b',
  textoGris: '#64748b',
  fondo: '#f1f5f9',
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
  tabla: {
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
  diasOk: {
    color: '#854d0e',
    fontWeight: '700',
    textAlign: 'center',
  },
  diasCritico: {
    color: C.rojo,
    fontWeight: '700',
    textAlign: 'center',
  },
  imgCentrada: {
    display: 'block',
    margin: '0 auto 24px auto',
    maxWidth: '100px',
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
  footerImg: {
    display: 'block',
    width: '100%',

    height: '120px',
    objectFit: 'cover',
    objectPosition: 'center 15%',
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
    objectPosition: 'center 20%',
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

// ─── Fila de tabla ────────────────────────────────────────────────────────────
function FilaTabla({ solicitud, indice }) {
  const diasRestantes = 15 - solicitud.dias_transcurridos;
  const celda = indice % 2 === 0 ? s.tdCell : s.tdCellAlt;
  const estiloDias = diasRestantes <= 3 ? s.diasCritico : s.diasOk;

  return (
    <tr key={solicitud.id_solicitud}>
      <td style={celda}>#{solicitud.id_solicitud}</td>
      <td style={celda}>{solicitud.solicitante_nombre}</td>
      <td style={celda}>{solicitud.vehiculo_placa}</td>
      <td style={{ ...celda, textAlign: 'center' }}>
        {solicitud.dias_transcurridos} día{solicitud.dias_transcurridos !== 1 ? 's' : ''}
      </td>
      <td style={{ ...celda, ...estiloDias }}>
        {diasRestantes <= 0 ? 'Vence hoy' : `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`}
      </td>
    </tr>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export function PlantillaUrgente({ empleado, solicitudes, preview = false }) {
  const nombre = empleado?.nombre_empleado ?? empleado?.nombre ?? 'Estimado colaborador';

  const img = {
    logo: preview ? '/static/icono-cotizador.png' : 'cid:logo-cotizador',
    alerta: preview ? '/static/alerta.png' : 'cid:alerta-img',
    footer: preview ? '/static/footer.png' : 'cid:footer-img',
  };

  return (
    <Html lang="es">
      <Head />
      <Preview>URGENTE: {solicitudes.length} cotización(es) a punto de vencerse. Actúa hoy.</Preview>
      <Body style={s.body}>
        <Container style={s.container}>

          {/* Header */}
          <Section style={s.header}>
            <Img
              src={img.logo}
              alt="Cotizador Altamira"
              width="90"
              height="auto"
              style={{ display: 'block', margin: '0 auto' }}
            />
            <Text style={s.headerTitle}>Cotizador Altamira Seguros</Text>
          </Section>

          {/* Banner urgente */}
          <Section style={s.bannerUrgente}>
            ⚠  ACCIÓN REQUERIDA — COTIZACIONES A PUNTO DE VENCERSE  ⚠
          </Section>

          {/* Contenido */}
          <Section style={s.content}>
            <Text style={s.saludo}>Hola, {nombre}</Text>

            <Text style={s.parrafoAlerta}>
              Las siguientes solicitudes llevan 12 o más días en estado borrador y vencerán
              automáticamente al día 15. Una vez vencidas, ya no podrás procesarlas.
              Por favor, contacta con urgencia al cliente para concretar cada cotización.
            </Text>

            {/* Tabla */}
            <table style={s.tabla} cellPadding="0" cellSpacing="0">
              <thead>
                <tr>
                  <th style={s.thCell}>#</th>
                  <th style={s.thCell}>Solicitante</th>
                  <th style={s.thCell}>Placa</th>
                  <th style={{ ...s.thCell, textAlign: 'center' }}>Días</th>
                  <th style={{ ...s.thCell, textAlign: 'center' }}>Días restantes</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((sol, i) => (
                  <FilaTabla key={sol.id_solicitud} solicitud={sol} indice={i} />
                ))}
              </tbody>
            </table>

            {/* Imagen alerta */}
            <Img
              src={img.alerta}
              alt="Alerta"
              style={s.imgCentrada}
            />

            <Hr style={s.hr} />

            <Text style={s.recordatorio}>
              ¡No lo olvides! Habla hoy con el cliente y concreta la cotización antes de que venza.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={s.footer}>
            <Img
              src={img.footer}
              alt="Altamira Seguros"
              style={s.footerImg}
            />
            <Text style={s.footerTexto}>
              © {new Date().getFullYear()} Altamira Seguros. Todos los derechos reservados.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ─── Exportaciones ────────────────────────────────────────────────────────────
export async function renderUrgente({ empleado, solicitudes }) {
  return render(<PlantillaUrgente empleado={empleado} solicitudes={solicitudes} preview={false} />);
}

export const asuntoUrgente = 'URGENTE: Se van a vencer estas cotizaciones';
