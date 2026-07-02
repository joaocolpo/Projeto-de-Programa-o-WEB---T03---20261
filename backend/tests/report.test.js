const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Report Endpoints', () => {
  let token;
  let userId;
  let foodCategoryId;
  let transportCategoryId;
  let salaryCategoryId;

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

    const foodRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alimentação', type: 'expense' });

    foodCategoryId = foodRes.body.category.id;

    const transportRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Transporte', type: 'expense' });

    transportCategoryId = transportRes.body.category.id;

    const salaryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Salário', type: 'income' });

    salaryCategoryId = salaryRes.body.category.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/reports/summary', () => {
    beforeAll(async () => {
      await prisma.transaction.deleteMany({ where: { userId } });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 3000.00,
          description: 'Salário mensal',
          date: '2026-01-15T00:00:00.000Z',
          type: 'income',
          categoryId: salaryCategoryId
        });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 500.00,
          description: 'Freelance',
          date: '2026-01-20T00:00:00.000Z',
          type: 'income',
          categoryId: salaryCategoryId
        });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 300.00,
          description: 'Supermercado',
          date: '2026-01-10T00:00:00.000Z',
          type: 'expense',
          categoryId: foodCategoryId
        });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 150.00,
          description: 'Combustível',
          date: '2026-01-15T00:00:00.000Z',
          type: 'expense',
          categoryId: transportCategoryId
        });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 75.00,
          description: 'Café',
          date: '2026-02-05T00:00:00.000Z',
          type: 'expense',
          categoryId: foodCategoryId
        });
    });

    it('deve retornar resumo financeiro geral', async () => {
      const res = await request(app)
        .get('/api/reports/summary')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('totalIncome', 3500.00);
      expect(res.body).toHaveProperty('totalExpense', 525.00);
      expect(res.body).toHaveProperty('balance', 2975.00);
      expect(res.body).toHaveProperty('period');
      expect(res.body.period.startDate).toBeNull();
      expect(res.body.period.endDate).toBeNull();
    });

    it('deve retornar resumo financeiro por período', async () => {
      const res = await request(app)
        .get('/api/reports/summary?startDate=2026-01-01&endDate=2026-01-31')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('totalIncome', 3500.00);
      expect(res.body).toHaveProperty('totalExpense', 450.00);
      expect(res.body).toHaveProperty('balance', 3050.00);
      expect(res.body).toHaveProperty('period');
      expect(res.body.period.startDate).toBe('2026-01-01');
      expect(res.body.period.endDate).toBe('2026-01-31');
    });

    it('deve retornar resumo zerado sem transações', async () => {
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sem Transações',
          email: 'sem-transacoes@example.com',
          password: 'password123'
        });

      const token2 = res2.body.token;

      const res = await request(app)
        .get('/api/reports/summary')
        .set('Authorization', `Bearer ${token2}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('totalIncome', 0);
      expect(res.body).toHaveProperty('totalExpense', 0);
      expect(res.body).toHaveProperty('balance', 0);
    });
  });

  describe('GET /api/reports/by-category', () => {
    beforeAll(async () => {
      await prisma.transaction.deleteMany({ where: { userId } });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 200.00,
          description: 'Supermercado semana 1',
          date: '2026-02-05T00:00:00.000Z',
          type: 'expense',
          categoryId: foodCategoryId
        });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 150.00,
          description: 'Restaurante',
          date: '2026-02-12T00:00:00.000Z',
          type: 'expense',
          categoryId: foodCategoryId
        });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100.00,
          description: 'Combustível',
          date: '2026-02-10T00:00:00.000Z',
          type: 'expense',
          categoryId: transportCategoryId
        });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 50.00,
          description: 'Ônibus',
          date: '2026-02-15T00:00:00.000Z',
          type: 'expense',
          categoryId: transportCategoryId
        });
    });

    it('deve retornar despesas por categoria', async () => {
      const res = await request(app)
        .get('/api/reports/by-category')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);

      const foodCategory = res.body.find(item => item.category.name === 'Alimentação');
      const transportCategory = res.body.find(item => item.category.name === 'Transporte');

      expect(foodCategory).toBeDefined();
      expect(foodCategory.total).toBe(350.00);
      expect(foodCategory.transactionCount).toBe(2);
      expect(foodCategory.percentage).toBeCloseTo(70.00);

      expect(transportCategory).toBeDefined();
      expect(transportCategory.total).toBe(150.00);
      expect(transportCategory.transactionCount).toBe(2);
      expect(transportCategory.percentage).toBeCloseTo(30.00);
    });

    it('deve retornar despesas por categoria com filtro de período', async () => {
      const res = await request(app)
        .get('/api/reports/by-category?startDate=2026-02-01&endDate=2026-02-28')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);

      const foodCategory = res.body.find(item => item.category.name === 'Alimentação');
      const transportCategory = res.body.find(item => item.category.name === 'Transporte');

      expect(foodCategory).toBeDefined();
      expect(foodCategory.total).toBe(350.00);

      expect(transportCategory).toBeDefined();
      expect(transportCategory.total).toBe(150.00);
      expect(transportCategory.transactionCount).toBe(2);
    });

    it('deve retornar array vazio quando não há despesas', async () => {
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Só Receita',
          email: 'so-receita@example.com',
          password: 'password123'
        });

      const token2 = res2.body.token;

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          amount: 1000.00,
          description: 'Salário',
          date: '2026-01-15T00:00:00.000Z',
          type: 'income'
        });

      const res = await request(app)
        .get('/api/reports/by-category')
        .set('Authorization', `Bearer ${token2}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
