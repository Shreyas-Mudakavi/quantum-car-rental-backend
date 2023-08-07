const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const secretKey = process.env.SECRET_KEY
const protect = (req, res, next) => {
   
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const tokenWithoutBearer = token.replace('Bearer ', '');
    const decoded = jwt.verify(tokenWithoutBearer, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = protect;