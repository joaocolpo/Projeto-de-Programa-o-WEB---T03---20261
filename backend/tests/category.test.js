const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Category Endpoints', () => {
  let token;
  let userId;

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
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/categories', () => {
    it('deve criar uma nova categoria', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Alimentação',
          type: 'expense'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Categoria criada com sucesso');
      expect(res.body.category).toHaveProperty('id');
      expect(res.body.category.name).toBe('Alimentação');
      expect(res.body.category.type).toBe('expense');
      expect(res.body.category.userId).toBe(userId);
    });

    it('não deve criar categoria com tipo inválido', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Tipo Inválido',
          type: 'invalid'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('não deve criar categoria duplicada para o mesmo usuário', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Viagem',
          type: 'expense'
        });

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Viagem',
          type: 'expense'
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('error', 'Já existe uma categoria com esse nome');
    });

    it('deve validar dados da categoria', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '',
          type: 'expense'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/categories', () => {
    it('deve retornar categorias do usuário', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Salário', type: 'income' });

      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Aluguel', type: 'expense' });

      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('categories');
      expect(Array.isArray(res.body.categories)).toBe(true);
      expect(res.body.categories.length).toBeGreaterThanOrEqual(2);
    });

    it('deve filtrar categorias por tipo', async () => {
      const res = await request(app)
        .get('/api/categories?type=income')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('categories');
      expect(Array.isArray(res.body.categories)).toBe(true);

      res.body.categories.forEach(category => {
        expect(category.type).toBe('income');
      });
    });
  });

  describe('GET /api/categories/:id', () => {
    let categoryId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Entretenimento', type: 'expense' });

      categoryId = res.body.category.id;
    });

    it('deve retornar categoria por ID', async () => {
      const res = await request(app)
        .get(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('category');
      expect(res.body.category.id).toBe(categoryId);
      expect(res.body.category.name).toBe('Entretenimento');
      expect(res.body.category.type).toBe('expense');
    });

    it('deve retornar 404 para categoria inexistente', async () => {
      const res = await request(app)
        .get(`/api/categories/99999`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Categoria não encontrada');
    });

    it('deve retornar 404 para categoria de outro usuário', async () => {
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Outro Usuário',
          email: 'outro@example.com',
          password: 'password123'
        });

      const token2 = res2.body.token;

      const res3 = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token2}`)
        .send({ name: 'Categoria Privada', type: 'expense' });

      const otherUserCategoryId = res3.body.category.id;

      const res = await request(app)
        .get(`/api/categories/${otherUserCategoryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Categoria não encontrada');
    });
  });

  describe('PUT /api/categories/:id', () => {
    let categoryId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nome Antigo', type: 'expense' });

      categoryId = res.body.category.id;
    });

    it('deve atualizar categoria', async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Nome Atualizado',
          type: 'income'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Categoria atualizada com sucesso');
      expect(res.body.category.name).toBe('Nome Atualizado');
      expect(res.body.category.type).toBe('income');
    });

    it('não deve atualizar com tipo inválido', async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'invalid'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('não deve atualizar para nome duplicado', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Outra Categoria', type: 'expense' });

      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Outra Categoria'
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('error', 'Já existe uma categoria com esse nome');
    });

    it('deve retornar 404 para categoria inexistente', async () => {
      const res = await request(app)
        .put(`/api/categories/99999`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Teste' });

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    let categoryId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Para Excluir', type: 'expense' });

      categoryId = res.body.category.id;
    });

    it('deve excluir categoria', async () => {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Categoria excluída com sucesso');
    });

    it('não deve excluir categoria com transações associadas', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Com Transações', type: 'expense' });

      const categoryIdWithTx = res.body.category.id;

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
          description: 'Transação teste',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: categoryIdWithTx
        });

      const res2 = await request(app)
        .delete(`/api/categories/${categoryIdWithTx}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res2.statusCode).toEqual(400);
      expect(res2.body).toHaveProperty('error', 'Não é possível excluir categoria com transações associadas');
    });

    it('deve retornar 404 para categoria inexistente', async () => {
      const res = await request(app)
        .delete(`/api/categories/99999`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
    });
  });
});
