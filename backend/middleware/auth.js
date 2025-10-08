const jwt = require('jsonwebtoken');

// Authenticate user with JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth header received:", authHeader);
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  console.log("🧩 Extracted token:", token);
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    //console.log("Decoded JWT user:", user);
    if (err) {
      console.error('JWT verify error:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log("✅ Decoded user:", user);
    req.user = user; // userId, email, role, etc.
    next();
  });
};

// Role-based access control
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role' });
    }
    next();
  };
};

/* const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}; */

module.exports = {
  authenticateToken,
  authorizeRole,
  //requireAuth
};
