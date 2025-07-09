const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_secret';

// Middleware d'authentification
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.actif) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou utilisateur inactif'
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

// Middleware pour vérifier le rôle admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès interdit. Droits administrateur requis'
    });
  }
  next();
};

// Middleware pour vérifier le rôle responsable
const isResponsable = (req, res, next) => {
  if (req.user.role !== 'responsable') {
    return res.status(403).json({
      success: false,
      message: 'Accès interdit. Droits responsable requis'
    });
  }
  next();
};

// Middleware pour vérifier le rôle responsable ou admin
const isResponsableOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'responsable') {
    return res.status(403).json({
      success: false,
      message: 'Accès interdit. Droits insuffisants'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isResponsable,
  isResponsableOrAdmin,
  JWT_SECRET
}; 