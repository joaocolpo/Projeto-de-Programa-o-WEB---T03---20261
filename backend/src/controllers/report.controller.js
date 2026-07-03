const reportService = require('../services/report.service');

class ReportController {
  async getFinancialSummary(req, res) {
    try {
      const userId = req.user.id;
      const filters = {};

      if (req.query.startDate) filters.startDate = req.query.startDate;
      if (req.query.endDate) filters.endDate = req.query.endDate;

      const summary = await reportService.getFinancialSummary(userId, filters);

      res.status(200).json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao gerar resumo financeiro' });
    }
  }

  async getExpensesByCategory(req, res) {
    try {
      const userId = req.user.id;
      const filters = {};

      if (req.query.startDate) filters.startDate = req.query.startDate;
      if (req.query.endDate) filters.endDate = req.query.endDate;

      const resultado = await reportService.getExpensesByCategory(userId, filters);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao gerar relatório por categoria' });
    }
  }

  async getExpensesByPeriod(req, res) {
    try {
      const userId = req.user.id;
      const filters = {};

      if (req.query.startDate) filters.startDate = req.query.startDate;
      if (req.query.endDate) filters.endDate = req.query.endDate;
      if (req.query.groupBy) filters.groupBy = req.query.groupBy;

      const resultado = await reportService.getExpensesByPeriod(userId, filters);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao gerar relatório por período' });
    }
  }
}

module.exports = new ReportController();
