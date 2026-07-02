const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTestDatabase() {
  try {
    await prisma.transaction.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Banco de testes limpo com sucesso');
  } catch (error) {
    console.error('Erro ao preparar banco de testes:', error);
    throw error;
  }
}

module.exports = { setupTestDatabase };
