const prisma = require('../config/prisma');

class ReportService {
  async getFinancialSummary(userId, filters = {}) {
    const where = { userId: parseInt(userId) };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    const [incomeResult, expenseResult] = await prisma.$transaction([
      prisma.transaction.aggregate({
        where: { ...where, type: 'income' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'expense' },
        _sum: { amount: true }
      })
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpense = expenseResult._sum.amount || 0;
    const balance = totalIncome - totalExpense;

    return {
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpense: parseFloat(totalExpense.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
      period: {
        startDate: filters.startDate || null,
        endDate: filters.endDate || null
      }
    };
  }

  async getExpensesByCategory(userId, filters = {}) {
    const where = {
      userId: parseInt(userId),
      type: 'expense'
    };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
      _count: true
    });

    const categoryIds = expensesByCategory
      .filter(item => item.categoryId !== null)
      .map(item => item.categoryId);

    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        userId: parseInt(userId)
      }
    });

    const result = expensesByCategory.map(item => {
      if (item.categoryId === null) {
        return {
          category: { id: null, name: 'Sem categoria', type: 'expense' },
          total: parseFloat((item._sum.amount || 0).toFixed(2)),
          transactionCount: item._count
        };
      }

      const category = categories.find(cat => cat.id === item.categoryId);
      if (!category) return null;

      return {
        category: {
          id: category.id,
          name: category.name,
          type: category.type
        },
        total: parseFloat((item._sum.amount || 0).toFixed(2)),
        transactionCount: item._count
      };
    }).filter(Boolean);

    const totalExpenses = result.reduce((sum, item) => sum + item.total, 0);

    const resultWithPercentage = result.map(item => ({
      ...item,
      percentage: totalExpenses > 0 ? parseFloat(((item.total / totalExpenses) * 100).toFixed(2)) : 0
    }));

    return resultWithPercentage.sort((a, b) => b.total - a.total);
  }

  async getExpensesByPeriod(userId, filters = {}) {
    const where = {
      userId: parseInt(userId),
      type: 'expense'
    };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    const groupBy = filters.groupBy || 'month';

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'asc' },
      select: { amount: true, date: true }
    });

    const grouped = {};
    for (const tx of transactions) {
      const d = new Date(tx.date);
      let key;

      if (groupBy === 'day') {
        key = d.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        key = startOfWeek.toISOString().split('T')[0];
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = { total: 0, count: 0 };
      }
      grouped[key].total += parseFloat(tx.amount);
      grouped[key].count += 1;
    }

    return Object.entries(grouped).map(([period, data]) => ({
      period,
      total: parseFloat(data.total.toFixed(2)),
      transactionCount: data.count
    }));
  }
}

module.exports = new ReportService();
