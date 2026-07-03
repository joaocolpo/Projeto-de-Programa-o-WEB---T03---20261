const categoryService = require('../services/category.service');
const { createCategorySchema, updateCategorySchema } = require('../utils/validators/category.validator');

class CategoryController {
  async createCategory(req, res) {
    try {
      const { error, value } = createCategorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const userId = req.user.id;
      const category = await categoryService.createCategory(userId, value);

      res.status(201).json({
        message: 'Categoria criada com sucesso',
        category
      });
    } catch (error) {
      if (error.message === 'Já existe uma categoria com esse nome') {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === 'Tipo da categoria deve ser "income" ou "expense"') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }

  async getCategories(req, res) {
    try {
      const userId = req.user.id;
      const filters = {};

      if (req.query.type) {
        filters.type = req.query.type;
      }

      const categories = await categoryService.getCategories(userId, filters);

      res.status(200).json({ categories });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  }

  async getCategoryById(req, res) {
    try {
      const userId = req.user.id;
      const categoryId = req.params.id;

      const category = await categoryService.getCategoryById(userId, categoryId);

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.status(200).json({ category });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar categoria' });
    }
  }

  async updateCategory(req, res) {
    try {
      const { error, value } = updateCategorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const userId = req.user.id;
      const categoryId = req.params.id;

      const category = await categoryService.updateCategory(userId, categoryId, value);

      res.status(200).json({
        message: 'Categoria atualizada com sucesso',
        category
      });
    } catch (error) {
      if (error.message === 'Já existe uma categoria com esse nome') {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === 'Tipo da categoria deve ser "income" ou "expense"') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Categoria não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
  }

  async deleteCategory(req, res) {
    try {
      const userId = req.user.id;
      const categoryId = req.params.id;

      await categoryService.deleteCategory(userId, categoryId);

      res.status(200).json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
      if (error.message === 'Categoria não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Não é possível excluir categoria com transações associadas') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
  }
}

module.exports = new CategoryController();
