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
    req.userId   = decoded.id;
    req.userRole = decoded.role; // número: 1=Admin, 2=Supervisor, 3=Empleado
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token no autorizado o expirado' });
  }
};

// Solo Administrador (rol 1)
const isAdmin = (req, res, next) => {
  if (req.userRole !== 1) {
    return res.status(403).json({ message: 'Requiere privilegios de administrador' });
  }
  next();
};

// Supervisor o Administrador (roles 2 y 1)
const isSupervisorOrAdmin = (req, res, next) => {
  if (req.userRole !== 1 && req.userRole !== 2) {
    return res.status(403).json({ message: 'Requiere privilegios de supervisor o administrador' });
  }
  next();
};

export { verifyToken, isAdmin, isSupervisorOrAdmin };
