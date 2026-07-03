const userService = require('../services/user.service');
const { updateUserSchema } = require('../utils/validators/user.validator');

class UserController {
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await userService.getProfile(userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { error, value } = updateUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const userId = req.user.id;
      const user = await userService.updateProfile(userId, value);

      res.status(200).json({
        message: 'Perfil atualizado com sucesso',
        user
      });
    } catch (error) {
      if (error.message === 'Email já está em uso') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }

  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      await userService.deleteAccount(userId);

      res.status(200).json({ message: 'Conta excluída com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir conta' });
    }
  }
}

module.exports = new UserController();
