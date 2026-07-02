const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const config = require('../config/database');

class UserModel {
  async create(userData) {
    const { name, email, password } = userData;

    const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash
      }
    });

    const { password: _, ...userSemSenha } = user;
    return userSemSenha;
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  async update(id, userData) {
    const { name, email } = userData;

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: parseInt(id) }
        }
      });

      if (existingUser) {
        throw new Error('Email já está em uso');
      }
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  async delete(id) {
    return await prisma.user.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new UserModel();
