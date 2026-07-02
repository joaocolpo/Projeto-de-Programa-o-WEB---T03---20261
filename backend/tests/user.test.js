const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('User Endpoints', () => {
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

  describe('GET /api/users/me', () => {
    it('deve retornar perfil do usuário autenticado', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.id).toBe(userId);
      expect(res.body.user.email).toBe('user@example.com');
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app)
        .get('/api/users/me');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Token de acesso necessário');
    });
  });

  describe('PUT /api/users/me', () => {
    it('deve atualizar perfil do usuário', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Nome Atualizado',
          email: 'atualizado@example.com'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Perfil atualizado com sucesso');
      expect(res.body.user.name).toBe('Nome Atualizado');
      expect(res.body.user.email).toBe('atualizado@example.com');
    });

    it('não deve atualizar com email inválido', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'email-invalido'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('não deve atualizar com email já em uso', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Outro Usuário',
          email: 'outro@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'outro@example.com'
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('error', 'Email já está em uso');
    });
  });

  describe('DELETE /api/users/me', () => {
    it('deve excluir conta do usuário', async () => {
      const res = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Conta excluída com sucesso');
    });

    it('deve retornar 401 após exclusão', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Token inválido ou expirado');
    });
  });
});
