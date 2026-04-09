/**
 * Preview — alerta de borradores 7+ días
 * Solo usa los datos de muestra. El diseño vive en src/emails/plantilla-alerta.jsx
 */

import React from 'react';
import { PlantillaAlerta } from '../src/emails/plantilla-alerta.jsx';

// ── Datos de muestra ──────────────────────────────────────────────────────────
const empleado = { nombre_empleado: 'Alejandro Salas' };
const solicitudes = [
  { id_solicitud: 101, solicitante_nombre: 'Carlos Pérez',    vehiculo_placa: 'ABC-123', dias_transcurridos: 8  },
  { id_solicitud: 102, solicitante_nombre: 'María González',  vehiculo_placa: 'XYZ-789', dias_transcurridos: 13 },
  { id_solicitud: 103, solicitante_nombre: 'Luis Ramírez',    vehiculo_placa: 'DEF-456', dias_transcurridos: 7  },
];

export default function PreviewAlerta() {
  return <PlantillaAlerta empleado={empleado} solicitudes={solicitudes} preview={true} />;
}
