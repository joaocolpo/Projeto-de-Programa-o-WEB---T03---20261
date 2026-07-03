require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/cointrack'
};

module.exports = config;
