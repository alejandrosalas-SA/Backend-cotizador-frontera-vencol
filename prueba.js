import { ejecutarAlertaBorradores, ejecutarAlertaUrgente } from './src/jobs/alertas.job.js';
await ejecutarAlertaBorradores();
await ejecutarAlertaUrgente();