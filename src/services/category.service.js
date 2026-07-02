const categoryModel = require('../models/category.model');

class CategoryService {
  async createCategory(userId, categoryData) {
    return await categoryModel.create(userId, categoryData);
  }

  async getCategories(userId, filters = {}) {
    return await categoryModel.findAllByUserId(userId, filters);
  }

  async getCategoryById(userId, categoryId) {
    return await categoryModel.findById(categoryId, userId);
  }

  async updateCategory(userId, categoryId, categoryData) {
    return await categoryModel.update(categoryId, userId, categoryData);
  }

  async deleteCategory(userId, categoryId) {
    return await categoryModel.delete(categoryId, userId);
  }
}

module.exports = new CategoryService();
