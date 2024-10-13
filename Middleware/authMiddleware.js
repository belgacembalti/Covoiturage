const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Récupérer le token du header Authorization

  if (!token) {
    return res.status(403).json({ message: 'Accès refusé, token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifier le token
    req.user = { id: decoded.userId }; // Récupérer l'ID de l'utilisateur à partir du token
    next(); // Passer au prochain middleware ou route
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = authMiddleware;
