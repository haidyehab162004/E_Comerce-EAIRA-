const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const required = ['JWT_SECRET', 'MONGO_URI'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = Object.freeze({
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
});
