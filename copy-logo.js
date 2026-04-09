import fs from 'fs';
import path from 'path';

const src = 'assets/Logos-Seguros-Altamira/icono-cotizador.png';
const targetDir = 'emails/static';
const target = path.join(targetDir, 'logo-cotizador.png');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.copyFileSync(src, target);
console.log('Copiado con éxito a ' + target);
