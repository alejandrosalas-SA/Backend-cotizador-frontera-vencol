/**
 * plantilla-alerta.jsx
 * Template de email para alertas de borradores con 7+ días.
 * Asunto: "Cotizaciones que se deben concretar"
 */

import React from 'react';
import { Html, Head, Body, Container, Section, Img, Text, Hr, Preview } from '@react-email/components';
import { render } from '@react-email/render';

// ─── Paleta ──────────────────────────────────────────────────────────────────
const C = {
  azul: '#003366',
  rojo: '#dc2626',
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
  parrafoUrgente: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: C.rojo,
    fontWeight: '600',
    backgroundColor: '#fee2e2',
    border: `1px solid ${C.rojo}`,
    borderRadius: '6px',
    padding: '10px 14px',
    marginBottom: '20px',
  },
  tabla: {
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
    maxWidth: '200px',
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
    objectPosition: 'center 15%',
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
  const esUrgente = solicitud.dias_transcurridos >= 12;
  const celda = indice % 2 === 0 ? s.tdCell : s.tdCellAlt;

  return (
    <tr key={solicitud.id_solicitud}>
      <td style={celda}>#{solicitud.id_solicitud}</td>
      <td style={celda}>{solicitud.solicitante_nombre}</td>
      <td style={celda}>{solicitud.vehiculo_placa}</td>
      <td style={{ ...celda, textAlign: 'center' }}>
        {solicitud.dias_transcurridos} día{solicitud.dias_transcurridos !== 1 ? 's' : ''}
      </td>
      <td style={{ ...celda, textAlign: 'center' }}>
        {esUrgente
          ? <span style={s.badgeUrgente}>⚠ URGENTE</span>
          : <span style={s.badgePendiente}>Pendiente</span>
        }
      </td>
    </tr>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export function PlantillaAlerta({ empleado, solicitudes, preview = false }) {
  const nombre = empleado?.nombre_empleado ?? empleado?.nombre ?? 'Estimado colaborador';
  const hayUrgentes = solicitudes.some(s => s.dias_transcurridos >= 12);

  const img = {
    logo: preview ? '/static/icono-cotizador.png' : 'cid:logo-cotizador',
    operadora: preview ? '/static/operadora.png' : 'cid:operadora',
    footer: preview ? '/static/footer.png' : 'cid:footer-img',
  };

  return (
    <Html lang="es">
      <Head />
      <Preview>Tienes {solicitudes.length} cotización(es) pendiente(s) de concretar. Por favor revísalas.</Preview>
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

          {/* Contenido */}
          <Section style={s.content}>
            <Text style={s.saludo}>Hola, {nombre}</Text>

            <Text style={s.parrafo}>
              Te informamos que tienes solicitudes de cotización en estado borrador que llevan varios días
              sin concretarse. Por favor, comunícate con el cliente correspondiente para avanzar con el
              proceso y lograr emitir la póliza.
            </Text>

            {hayUrgentes && (
              <Text style={s.parrafoUrgente}>
                ⚠ Algunas de estas solicitudes ya superan los 12 días y deben atenderse con urgencia.
                Vencen automáticamente al día 15.
              </Text>
            )}

            {/* Tabla */}
            <table style={s.tabla} cellPadding="0" cellSpacing="0">
              <thead>
                <tr>
                  <th style={s.thCell}>#</th>
                  <th style={s.thCell}>Solicitante</th>
                  <th style={s.thCell}>Placa</th>
                  <th style={{ ...s.thCell, textAlign: 'center' }}>Días</th>
                  <th style={{ ...s.thCell, textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((sol, i) => (
                  <FilaTabla key={sol.id_solicitud} solicitud={sol} indice={i} />
                ))}
              </tbody>
            </table>

            {/* Imagen operadora */}
            <Img
              src={img.operadora}
              alt="Operadora"
              style={s.imgCentrada}
            />

            <Hr style={s.hr} />

            <Text style={s.recordatorio}>
              Por favor no olvides gestionar estas cotizaciones. ¡Tu gestión hace la diferencia!
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
export async function renderAlerta({ empleado, solicitudes }) {
  return render(<PlantillaAlerta empleado={empleado} solicitudes={solicitudes} preview={false} />);
}

export const asuntoAlerta = 'Cotizaciones que se deben concretar';
