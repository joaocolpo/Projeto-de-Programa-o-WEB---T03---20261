const userModel = require('../models/user.model');

class UserService {
  async getProfile(userId) {
    return await userModel.findById(userId);
  }

  async updateProfile(userId, userData) {
    return await userModel.update(userId, userData);
  }

  async deleteAccount(userId) {
    return await userModel.delete(userId);
  }
}

module.exports = new UserService();
