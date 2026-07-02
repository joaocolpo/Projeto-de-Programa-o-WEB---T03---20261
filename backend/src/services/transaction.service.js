const transactionModel = require('../models/transaction.model');

class TransactionService {
  async createTransaction(userId, transactionData) {
    return await transactionModel.create(userId, transactionData);
  }

  async getTransactions(userId, filters = {}, pagination = {}) {
    return await transactionModel.findAllByUserId(userId, filters, pagination);
  }

  async getTransactionById(userId, transactionId) {
    return await transactionModel.findById(transactionId, userId);
  }

  async updateTransaction(userId, transactionId, transactionData) {
    return await transactionModel.update(transactionId, userId, transactionData);
  }

  async deleteTransaction(userId, transactionId) {
    return await transactionModel.delete(transactionId, userId);
  }
}

module.exports = new TransactionService();
