const transactionService = require('../services/transaction.service');
const { createTransactionSchema, updateTransactionSchema } = require('../utils/validators/transaction.validator');

class TransactionController {
  async createTransaction(req, res) {
    try {
      const { error, value } = createTransactionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const userId = req.user.id;
      const transaction = await transactionService.createTransaction(userId, value);

      res.status(201).json({
        message: 'Transação criada com sucesso',
        transaction
      });
    } catch (error) {
      if (error.message === 'Tipo da transação deve ser "income" ou "expense"') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Categoria não encontrada ou não pertence ao usuário') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Tipo da categoria deve corresponder ao tipo da transação') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao criar transação' });
    }
  }

  async getTransactions(req, res) {
    try {
      const userId = req.user.id;
      const filters = {};
      const pagination = {};

      if (req.query.type) filters.type = req.query.type;
      if (req.query.startDate) filters.startDate = req.query.startDate;
      if (req.query.endDate) filters.endDate = req.query.endDate;
      if (req.query.categoryId) filters.categoryId = req.query.categoryId;

      if (req.query.page) pagination.page = parseInt(req.query.page);
      if (req.query.limit) pagination.limit = parseInt(req.query.limit);

      const result = await transactionService.getTransactions(userId, filters, pagination);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar transações' });
    }
  }

  async getTransactionById(req, res) {
    try {
      const userId = req.user.id;
      const transactionId = req.params.id;

      const transaction = await transactionService.getTransactionById(userId, transactionId);

      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      res.status(200).json({ transaction });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar transação' });
    }
  }

  async updateTransaction(req, res) {
    try {
      const { error, value } = updateTransactionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const userId = req.user.id;
      const transactionId = req.params.id;

      const transaction = await transactionService.updateTransaction(userId, transactionId, value);

      res.status(200).json({
        message: 'Transação atualizada com sucesso',
        transaction
      });
    } catch (error) {
      if (error.message === 'Tipo da transação deve ser "income" ou "expense"') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Categoria não encontrada ou não pertence ao usuário') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Tipo da categoria deve corresponder ao tipo da transação') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Transação não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao atualizar transação' });
    }
  }

  async deleteTransaction(req, res) {
    try {
      const userId = req.user.id;
      const transactionId = req.params.id;

      await transactionService.deleteTransaction(userId, transactionId);

      res.status(200).json({ message: 'Transação excluída com sucesso' });
    } catch (error) {
      if (error.message === 'Transação não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao excluir transação' });
    }
  }
}

module.exports = new TransactionController();
