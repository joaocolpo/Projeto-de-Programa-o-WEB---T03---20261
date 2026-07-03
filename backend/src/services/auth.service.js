const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const config = require('../config/database');

class AuthService {
  async register(userData) {
    const existingUser = await userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Já existe um usuário com esse email');
    }

    const user = await userModel.create(userData);
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(email, password) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const senhaValida = await userModel.comparePassword(password, user.password);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    const { password: _, ...userSemSenha } = user;
    const token = this.generateToken(userSemSenha);

    return { user: userSemSenha, token };
  }

  generateToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }
}

module.exports = new AuthService();
