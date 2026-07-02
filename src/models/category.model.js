const prisma = require('../config/prisma');

class CategoryModel {
  async create(userId, categoryData) {
    const { name, type } = categoryData;

    if (!['income', 'expense'].includes(type)) {
      throw new Error('Tipo da categoria deve ser "income" ou "expense"');
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: parseInt(userId),
        name: name
      }
    });

    if (existingCategory) {
      throw new Error('Já existe uma categoria com esse nome');
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId: parseInt(userId)
      }
    });

    return category;
  }

  async findAllByUserId(userId, filters = {}) {
    const where = { userId: parseInt(userId) };

    if (filters.type) {
      where.type = filters.type;
    }

    return await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  }

  async findById(id, userId) {
    return await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      }
    });
  }

  async update(id, userId, categoryData) {
    const { name, type } = categoryData;

    if (type && !['income', 'expense'].includes(type)) {
      throw new Error('Tipo da categoria deve ser "income" ou "expense"');
    }

    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Categoria não encontrada');
    }

    if (name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          userId: parseInt(userId),
          name: name,
          NOT: { id: parseInt(id) }
        }
      });

      if (existingCategory) {
        throw new Error('Já existe uma categoria com esse nome');
      }
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) data.type = type;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data
    });

    return category;
  }

  async delete(id, userId) {
    const transactionCount = await prisma.transaction.count({
      where: {
        categoryId: parseInt(id),
        userId: parseInt(userId)
      }
    });

    if (transactionCount > 0) {
      throw new Error('Não é possível excluir categoria com transações associadas');
    }

    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Categoria não encontrada');
    }

    return await prisma.category.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new CategoryModel();
