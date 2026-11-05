const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

async function protect(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'يرجى تسجيل الدخول أولاً.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'المستخدم غير موجود.' });
    if (!user.isActive) return res.status(403).json({ message: 'هذا الحساب موقوف.' });

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'رمز الدخول غير صالح أو منتهي.' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'يرجى تسجيل الدخول أولاً.' });
    if (roles.includes('admin') && req.user.isAdmin) return next();
    return res.status(403).json({ message: 'ليست لديك صلاحية لتنفيذ هذه العملية.' });
  };
}

module.exports = { protect, authorize };
