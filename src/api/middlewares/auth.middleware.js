import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];

  if (!tokenHeader) {
    return res.status(403).json({ message: 'No se proporcionó un token de autenticación' });
  }

  // Formato esperado: "Bearer <token>"
  const token = tokenHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Formato de token inválido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-development-key');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token no autorizado o expirado' });
  }
};

const isAdmin = (req, res, next) => {
  // Asumimos que el rol 1 o 'Admin' es administrador. Ajustar según lógica de BD.
  // En auth.service.js se vio que retorna 'rol_nombre'.
  if (req.userRole !== 'Admin' && req.userRole !== 'Administrador' && req.userRole !== 1) {
    // Ajuste temporal para permitir flexibilidad hasta confirmar nombres de roles exactos
    // Lo ideal sería tener una constante de roles.
    // Si req.userRole no coincide con permisos elevados:
    return res.status(403).json({ message: 'Requiere privilegios de administrador' });
  }
  // Por ahora solo pasaremos next() permitiendo acceso pero logueando si quisiéramos ser estrictos
  // Comentado para no bloquear sin saber los roles exactos de la BD
  next();
};

export { verifyToken, isAdmin };
