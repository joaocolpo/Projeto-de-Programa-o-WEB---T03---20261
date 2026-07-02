const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function teardownTestDatabase() {
  try {
    await prisma.transaction.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    console.log('Banco de testes finalizado com sucesso');
  } catch (error) {
    console.error('Erro ao finalizar banco de testes:', error);
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Erro ao desconectar:', disconnectError);
    }
    throw error;
  }
}

module.exports = { teardownTestDatabase };
