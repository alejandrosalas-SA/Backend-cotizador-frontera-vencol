/**
 * Preview — alerta urgente de borradores 12+ días
 * Solo usa los datos de muestra. El diseño vive en src/emails/plantilla-urgente.jsx
 */

import React from 'react';
import { PlantillaUrgente } from '../src/emails/plantilla-urgente.jsx';

// ── Datos de muestra ──────────────────────────────────────────────────────────
const empleado = { nombre_empleado: 'Alejandro Salas' };
const solicitudes = [
  { id_solicitud: 102, solicitante_nombre: 'María González', vehiculo_placa: 'XYZ-789', dias_transcurridos: 13 },
  { id_solicitud: 104, solicitante_nombre: 'Pedro Castillo',  vehiculo_placa: 'GHI-321', dias_transcurridos: 14 },
];

export default function PreviewUrgente() {
  return <PlantillaUrgente empleado={empleado} solicitudes={solicitudes} preview={true} />;
}
