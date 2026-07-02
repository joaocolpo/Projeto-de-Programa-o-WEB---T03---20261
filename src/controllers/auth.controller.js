const authService = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../utils/validators/auth.validator');

class AuthController {
  async register(req, res, next) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, email, password } = value;
      const { user, token } = await authService.register({ name, email, password });

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso',
        user,
        token
      });
    } catch (error) {
      if (error.message === 'Já existe um usuário com esse email') {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, password } = value;
      const { user, token } = await authService.login(email, password);

      res.status(200).json({
        message: 'Login realizado com sucesso',
        user,
        token
      });
    } catch (error) {
      if (error.message === 'Credenciais inválidas') {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  }

  async me(req, res) {
    res.status(200).json({ user: req.user });
  }
}

module.exports = new AuthController();
