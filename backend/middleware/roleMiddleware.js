const { protect } = require('./authMiddleware');

const adminOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, please log in' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admin only' });
  }

  next();
};

const subadminOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, please log in' });
  }

  if (req.user.role !== 'subadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, subadmin or admin only' });
  }

  next();
};

const userOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, please log in' });
  }

  if (req.user.role !== 'user' && req.user.role !== 'subadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};

module.exports = { adminOnly, subadminOnly, userOnly };