const prisma = require('../config/prisma');

class TransactionModel {
  async create(userId, transactionData) {
    const { amount, description, date, type, categoryId } = transactionData;

    if (!['income', 'expense'].includes(type)) {
      throw new Error('Tipo da transação deve ser "income" ou "expense"');
    }

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: parseInt(categoryId),
          userId: parseInt(userId)
        }
      });

      if (!category) {
        throw new Error('Categoria não encontrada ou não pertence ao usuário');
      }

      if (category.type !== type) {
        throw new Error('Tipo da categoria deve corresponder ao tipo da transação');
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description: description || null,
        date: new Date(date),
        type,
        userId: parseInt(userId),
        categoryId: categoryId ? parseInt(categoryId) : null
      }
    });

    return transaction;
  }

  async findAllByUserId(userId, filters = {}, pagination = {}) {
    const where = { userId: parseInt(userId) };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    if (filters.categoryId) {
      where.categoryId = parseInt(filters.categoryId);
    }

    const skip = (pagination.page - 1) * pagination.limit || 0;
    const take = pagination.limit || 10;

    const [transactions, totalCount] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take,
        include: {
          category: {
            select: { id: true, name: true, type: true }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);

    return {
      transactions,
      pagination: {
        total: totalCount,
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        pages: Math.ceil(totalCount / (pagination.limit || 10))
      }
    };
  }

  async findById(id, userId) {
    return await prisma.transaction.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      },
      include: {
        category: {
          select: { id: true, name: true, type: true }
        }
      }
    });
  }

  async update(id, userId, transactionData) {
    const { amount, description, date, type, categoryId } = transactionData;

    if (type && !['income', 'expense'].includes(type)) {
      throw new Error('Tipo da transação deve ser "income" ou "expense"');
    }

    if (categoryId !== undefined && categoryId !== null) {
      const category = await prisma.category.findFirst({
        where: {
          id: parseInt(categoryId),
          userId: parseInt(userId)
        }
      });

      if (!category) {
        throw new Error('Categoria não encontrada ou não pertence ao usuário');
      }

      const tipoTransacao = type || (await this.getTypeById(id, userId));

      if (category.type !== tipoTransacao) {
        throw new Error('Tipo da categoria deve corresponder ao tipo da transação');
      }
    }

    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Transação não encontrada');
    }

    const data = {};
    if (amount !== undefined) data.amount = parseFloat(amount);
    if (description !== undefined) data.description = description || null;
    if (date !== undefined) data.date = new Date(date);
    if (type !== undefined) data.type = type;
    if (categoryId !== undefined) data.categoryId = categoryId !== null ? parseInt(categoryId) : null;

    const transaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data,
      include: {
        category: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    return transaction;
  }

  async getTypeById(id, userId) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      },
      select: { type: true }
    });

    return transaction ? transaction.type : null;
  }

  async delete(id, userId) {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Transação não encontrada');
    }

    return await prisma.transaction.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new TransactionModel();
