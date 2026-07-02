const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Transaction Endpoints', () => {
  let token;
  let userId;
  let incomeCategoryId;
  let expenseCategoryId;

  beforeAll(async () => {
    await prisma.transaction.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123'
      });

    token = res.body.token;
    userId = res.body.user.id;

    const incomeRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Salário', type: 'income' });

    incomeCategoryId = incomeRes.body.category.id;

    const expenseRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alimentação', type: 'expense' });

    expenseCategoryId = expenseRes.body.category.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/transactions', () => {
    it('deve criar uma transação de receita', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 3000.00,
          description: 'Salário mensal',
          date: new Date().toISOString(),
          type: 'income',
          categoryId: incomeCategoryId
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Transação criada com sucesso');
      expect(res.body.transaction).toHaveProperty('id');
      expect(res.body.transaction.amount).toBe(3000);
      expect(res.body.transaction.type).toBe('income');
      expect(res.body.transaction.description).toBe('Salário mensal');
      expect(res.body.transaction.categoryId).toBe(incomeCategoryId);
    });

    it('deve criar uma transação de despesa sem categoria', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 50.00,
          description: 'Café',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: null
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Transação criada com sucesso');
      expect(res.body.transaction.categoryId).toBeNull();
    });

    it('não deve criar transação com tipo inválido', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
          description: 'Teste',
          date: new Date().toISOString(),
          type: 'invalid',
          categoryId: incomeCategoryId
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('não deve criar transação com tipo de categoria incompatível', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
          description: 'Teste',
          date: new Date().toISOString(),
          type: 'income',
          categoryId: expenseCategoryId
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Tipo da categoria deve corresponder ao tipo da transação');
    });

    it('não deve criar transação com categoria inexistente', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
          description: 'Teste',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: 99999
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Categoria não encontrada ou não pertence ao usuário');
    });

    it('deve validar dados da transação', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: -10,
          description: 'Teste',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: expenseCategoryId
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/transactions', () => {
    let transactionId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100.00,
          description: 'Transação teste',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: expenseCategoryId
        });

      transactionId = res.body.transaction.id;
    });

    it('deve retornar transações com paginação', async () => {
      const res = await request(app)
        .get('/api/transactions?page=1&limit=5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('transactions');
      expect(Array.isArray(res.body.transactions)).toBe(true);
      expect(res.body.transactions.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('total');
      expect(res.body.pagination).toHaveProperty('page');
      expect(res.body.pagination).toHaveProperty('limit');
      expect(res.body.pagination).toHaveProperty('pages');
    });

    it('deve filtrar transações por tipo', async () => {
      const res = await request(app)
        .get('/api/transactions?type=expense')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('transactions');
      expect(Array.isArray(res.body.transactions)).toBe(true);

      res.body.transactions.forEach(transaction => {
        expect(transaction.type).toBe('expense');
      });
    });

    it('deve filtrar transações por período', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const res = await request(app)
        .get(`/api/transactions?startDate=${yesterday.toISOString()}&endDate=${today.toISOString()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('transactions');
      expect(Array.isArray(res.body.transactions)).toBe(true);

      res.body.transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        expect(transactionDate >= yesterday && transactionDate <= today).toBe(true);
      });
    });

    it('deve filtrar transações por categoria', async () => {
      const res = await request(app)
        .get(`/api/transactions?categoryId=${expenseCategoryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('transactions');
      expect(Array.isArray(res.body.transactions)).toBe(true);

      res.body.transactions.forEach(transaction => {
        expect(transaction.categoryId).toBe(expenseCategoryId);
      });
    });
  });

  describe('GET /api/transactions/:id', () => {
    let transactionId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 200.00,
          description: 'Transação para buscar',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: expenseCategoryId
        });

      transactionId = res.body.transaction.id;
    });

    it('deve retornar transação por ID', async () => {
      const res = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('transaction');
      expect(res.body.transaction.id).toBe(transactionId);
      expect(res.body.transaction.amount).toBe(200);
      expect(res.body.transaction.description).toBe('Transação para buscar');
      expect(res.body.transaction.category).toHaveProperty('id', expenseCategoryId);
    });

    it('deve retornar 404 para transação inexistente', async () => {
      const res = await request(app)
        .get('/api/transactions/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Transação não encontrada');
    });

    it('deve retornar 404 para transação de outro usuário', async () => {
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Outro Usuário',
          email: 'outro@example.com',
          password: 'password123'
        });

      const token2 = res2.body.token;

      const res3 = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          amount: 50,
          description: 'Transação privada',
          date: new Date().toISOString(),
          type: 'expense'
        });

      const otherUserTransactionId = res3.body.transaction.id;

      const res = await request(app)
        .get(`/api/transactions/${otherUserTransactionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Transação não encontrada');
    });
  });

  describe('PUT /api/transactions/:id', () => {
    let transactionId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100.00,
          description: 'Para atualizar',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: expenseCategoryId
        });

      transactionId = res.body.transaction.id;
    });

    it('deve atualizar transação', async () => {
      const res = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 150.00,
          description: 'Transação atualizada',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: expenseCategoryId
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Transação atualizada com sucesso');
      expect(res.body.transaction.amount).toBe(150);
      expect(res.body.transaction.description).toBe('Transação atualizada');
    });

    it('não deve atualizar com tipo inválido', async () => {
      const res = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'invalid'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('não deve atualizar com tipo de categoria incompatível', async () => {
      const res2 = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bônus', type: 'income' });

      const bonusCategoryId = res2.body.category.id;

      const res = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          categoryId: bonusCategoryId
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Tipo da categoria deve corresponder ao tipo da transação');
    });

    it('deve retornar 404 para transação inexistente', async () => {
      const res = await request(app)
        .put('/api/transactions/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 100 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Transação não encontrada');
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    let transactionId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 75.00,
          description: 'Para excluir',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: expenseCategoryId
        });

      transactionId = res.body.transaction.id;
    });

    it('deve excluir transação', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Transação excluída com sucesso');
    });

    it('deve retornar 404 para transação inexistente', async () => {
      const res = await request(app)
        .delete('/api/transactions/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Transação não encontrada');
    });
  });
});
