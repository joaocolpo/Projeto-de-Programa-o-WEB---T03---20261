# CoinTrack Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete backend for CoinTrack, a personal finance tracker with user authentication, transaction management, categorization, and financial reporting.

**Architecture:** Modular MVC architecture with clear separation of concerns: controllers handle HTTP requests, services contain business logic, models define data structure, routes define API endpoints, and middlewares handle cross-cutting concerns like authentication and validation.

**Tech Stack:** Node.js, Express.js, PostgreSQL, Prisma ORM, JWT authentication, bcrypt password hashing, Joi validation.

---
### Task 1: Project Setup and Initial Configuration

**Files:**
- Create: `package.json`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `src/server.js`
- Create: `src/app.js`
- Create: `src/config/database.js`
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Initialize npm project and install dependencies**

```bash
npm init -y
npm install express prisma @prisma/client jsonwebtoken bcryptjs joi cors dotenv
npm install --save-dev nodemon jest supertest
```

- [ ] **Step 2: Create basic package.json scripts**

```json
{
  "name": "cointrack-backend",
  "version": "1.0.0",
  "description": "Backend for CoinTrack personal finance app",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "joi": "^17.7.0",
    "jsonwebtoken": "^9.0.0",
    "@prisma/client": "^4.8.0",
    "prisma": "^4.8.0"
  },
  "devDependencies": {
    "jest": "^29.3.1",
    "nodemon": "^2.0.20",
    "supertest": "^6.3.1"
  }
}
```

- [ ] **Step 3: Create .env.example file**

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/cointrack?schema=public"
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

- [ ] **Step 4: Create .gitignore file**

```gitignore
# Dependencies
node_modules/
/package-lock.json
/yarn.lock
/pnpm-lock.yaml
/yarn-error.log

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Prisma
prisma/*.sql
prisma/**/*.sql

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

- [ ] **Step 5: Create basic Express app structure**

```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
```

- [ ] **Step 6: Create server entry point**

```javascript
// src/server.js
const app = require('./app');
const { PORT } = require('./config/database');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

- [ ] **Step 7: Create database configuration**

```javascript
// src/config/database.js
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/cointrack'
};

module.exports = config;
```

- [ ] **Step 8: Initialize Prisma and create initial schema**

```bash
npx prisma init
```

- [ ] **Step 9: Create initial Prisma schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  categories Category[]
  transactions Transaction[]
  
  @@index([email])
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String
  type      String   // "income" or "expense"
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, name])
  @@index([userId])
}

model Transaction {
  id          Int      @id @default(autoincrement())
  amount      Decimal  @db.Decimal(10, 2)
  description String?
  date        DateTime
  type        String   // "income" or "expense"
  userId      Int
  categoryId  Int?     // nullable for transactions without category
  user        User     @relation(fields: [userId], references: [id])
  category    Category? @relation(fields: [categoryId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([userId, date])
  @@index([userId, type])
}
```

- [ ] **Step 10: Generate Prisma client and test database connection**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

- [ ] **Step 11: Commit initial setup**

```bash
git add .
git commit -m "feat: initial project setup with Express, Prisma, and basic configuration"
```

### Task 2: User Authentication System

**Files:**
- Create: `src/models/user.model.js`
- Create: `src/services/auth.service.js`
- Create: `src/controllers/auth.controller.js`
- Create: `src/routes/auth.routes.js`
- Create: `src/middlewares/auth.middleware.js`
- Create: `src/utils/validators/auth.validator.js`
- Create: `tests/auth.test.js`

- [ ] **Step 1: Create User model service functions**

```javascript
// src/models/user.model.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const prisma = new PrismaClient();

class UserModel {
  async create(userData) {
    const { name, email, password } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash
      }
    });
    
    // Remove password from returned object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
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
}

module.exports = new UserModel();
```

- [ ] **Step 2: Create authentication service**

```javascript
// src/services/auth.service.js
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const config = require('../config/database');

class AuthService {
  async register(userData) {
    // Check if user already exists
    const existingUser = await userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    
    // Create new user
    const user = await userModel.create(userData);
    
    // Generate JWT token
    const token = this.generateToken(user);
    
    return { user, token };
  }
  
  async login(email, password) {
    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check password
    const isValidPassword = await userModel.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    
    // Generate JWT token
    const token = this.generateToken(userWithoutPassword);
    
    return { user: userWithoutPassword, token };
  }
  
  generateToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }
  
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();
```

- [ ] **Step 3: Create authentication validator**

```javascript
// src/utils/validators/auth.validator.js
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required()
});

module.exports = {
  registerSchema,
  loginSchema
};
```

- [ ] **Step 4: Create authentication controller**

```javascript
// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../utils/validators/auth.validator');

class AuthController {
  async register(req, res, next) {
    try {
      // Validate input
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      
      const { name, email, password } = value;
      
      // Register user
      const { user, token } = await authService.register({ name, email, password });
      
      res.status(201).json({
        message: 'User registered successfully',
        user,
        token
      });
    } catch (error) {
      if (error.message === 'User already exists with this email') {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }
  
  async login(req, res, next) {
    try {
      // Validate input
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      
      const { email, password } = value;
      
      // Login user
      const { user, token } = await authService.login(email, password);
      
      res.status(200).json({
        message: 'Login successful',
        user,
        token
      });
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  }
  
  async me(req, res) {
    // req.user is set by auth middleware
    res.status(200).json({ user: req.user });
  }
}

module.exports = new AuthController();
```

- [ ] **Step 5: Create authentication middleware**

```javascript
// src/middlewares/auth.middleware.js
const authService = require('../services/auth.service');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const payload = authService.verifyToken(token);
    // Attach user to request object
    req.user = {
      id: payload.userId,
      email: payload.email
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  authenticateToken
};
```

- [ ] **Step 6: Create authentication routes**

```javascript
// src/routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticateToken, authController.me);

module.exports = router;
```

- [ ] **Step 7: Register auth routes in app**

```javascript
// src/app.js (modify to add auth routes)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', require('./routes/auth.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
```

- [ ] **Step 8: Create authentication tests**

```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Clear test data
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body).toHaveProperty('token');
    });
    
    it('should not register user with existing email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: 'test@example.com',
          password: 'password456'
        });
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: 'test@example.com',
          password: 'password456'
        });
      
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('error', 'User already exists with this email');
    });
    
    it('should validate registration data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A', // too short
          email: 'invalid-email',
          password: '123' // too short
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body).toHaveProperty('token');
    });
    
    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
    
    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
  
  describe('GET /api/auth/me', () => {
    let token;
    
    beforeAll(async () => {
      // Login to get token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      token = loginRes.body.token;
    });
    
    it('should return user data when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
    });
    
    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Access token required');
    });
    
    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });
});
```

- [ ] **Step 9: Run authentication tests**

```bash
npm test
```

- [ ] **Step 10: Commit authentication implementation**

```bash
git add .
git commit -m "feat: implement user authentication system with JWT and bcrypt"
```

### Task 3: User Management System

**Files:**
- Create: `src/models/user.model.js` (extend existing)
- Create: `src/services/user.service.js`
- Create: `src/controllers/user.controller.js`
- Create: `src/routes/user.routes.js`
- Create: `tests/user.test.js`

- [ ] **Step 1: Extend user model with additional methods**

```javascript
// src/models/user.model.js (update existing file)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const prisma = new PrismaClient();

class UserModel {
  // ... existing methods ...
  
  async update(id, userData) {
    const { name, email } = userData;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: parseInt(id) }
        }
      });
      
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email
      },
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
```

- [ ] **Step 2: Create user service**

```javascript
// src/services/user.service.js
const userModel = require('../models/user.model');

class UserService {
  async getProfile(userId) {
    return await userModel.findById(userId);
  }
  
  async updateProfile(userId, userData) {
    return await userModel.update(userId, userData);
  }
  
  async deleteAccount(userId) {
    return await userModel.delete(userId);
  }
}

module.exports = new UserService();
```

- [ ] **Step 3: Create user validator**

```javascript
// src/utils/validators/user.validator.js
const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional()
}).min(1); // At least one field must be provided

module.exports = {
  updateUserSchema
};
```

- [ ] **Step 4: Create user controller**

```javascript
// src/controllers/user.controller.js
const userService = require('../services/user.service');
const { updateUserSchema } = require('../utils/validators/user.validator');

class UserController {
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await userService.getProfile(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }
  
  async updateProfile(req, res) {
    try {
      // Validate input
      const { error, value } = updateUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      
      const userId = req.user.id;
      const user = await userService.updateProfile(userId, value);
      
      res.status(200).json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      if (error.message === 'Email already in use') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
  
  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      await userService.deleteAccount(userId);
      
      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }
}

module.exports = new UserController();
```

- [ ] **Step 5: Create user routes**

```javascript
// src/routes/user.routes.js
const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.delete('/me', userController.deleteAccount);

module.exports = router;
```

- [ ] **Step 6: Register user routes in app**

```javascript
// src/app.js (add user routes)
// ... existing code ...
// Auth routes
app.use('/api/auth', require('./routes/auth.routes'));
// User routes
app.use('/api/users', require('./routes/user.routes'));
// ... rest of the code ...
```

- [ ] **Step 7: Create user tests**

```javascript
// tests/user.test.js
const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('User Endpoints', () => {
  let token;
  let userId;
  
  beforeAll(async () => {
    // Clear test data
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    
    // Create a test user
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
    it('should return user profile when authenticated', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.id).toBe(userId);
      expect(res.body.user.email).toBe('user@example.com');
    });
    
    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/users/me');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Access token required');
    });
  });
  
  describe('PUT /api/users/me', () => {
    it('should update user profile', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated User Name',
          email: 'updated@example.com'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Profile updated successfully');
      expect(res.body.user.name).toBe('Updated User Name');
      expect(res.body.user.email).toBe('updated@example.com');
    });
    
    it('should not update with invalid email', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'invalid-email'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
    
    it('should not update with email already in use', async () => {
      // Create another user first
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123'
        });
      
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'another@example.com'
        });
      
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('error', 'Email already in use');
    });
  });
  
  describe('DELETE /api/users/me', () => {
    it('should delete user account', async () => {
      const res = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Account deleted successfully');
    });
    
    it('should return 401 for deleted user', async () => {
      // Try to access protected route after deletion
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });
});
```

- [ ] **Step 8: Run user tests**

```bash
npm test
```

- [ ] **Step 9: Commit user management implementation**

```bash
git add .
git commit -m "feat: implement user management system with profile CRUD operations"
```

### Task 4: Category Management System

**Files:**
- Create: `src/models/category.model.js`
- Create: `src/services/category.service.js`
- Create: `src/controllers/category.controller.js`
- Create: `src/routes/category.routes.js`
- Create: `src/utils/validators/category.validator.js`
- Create: `tests/category.test.js`

- [ ] **Step 1: Create category model**

```javascript
// src/models/category.model.js
const { PrismaClient } = require('@prisma/client');
const config = require('../config/database');

const prisma = new PrismaClient();

class CategoryModel {
  async create(userId, categoryData) {
    const { name, type } = categoryData;
    
    // Validate type
    if (!['income', 'expense'].includes(type)) {
      throw new Error('Category type must be either "income" or "expense"');
    }
    
    // Check if category with same name already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: parseInt(userId),
        name: name
      }
    });
    
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId: parseInt(userId)
      }
    });
    
    return category;
  }
  
  async findAllByUserId(userId, filters = {}) {
    const where = {
      userId: parseInt(userId)
    };
    
    // Filter by type if provided
    if (filters.type) {
      where.type = filters.type;
    }
    
    return await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  }
  
  async findById(id, userId) {
    return await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      }
    });
  }
  
  async update(id, userId, categoryData) {
    const { name, type } = categoryData;
    
    // Validate type if provided
    if (type && !['income', 'expense'].includes(type)) {
      throw new Error('Category type must be either "income" or "expense"');
    }
    
    // Check if category with same name already exists for this user (excluding current)
    if (name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          userId: parseInt(userId),
          name: name,
          NOT: { id: parseInt(id) }
        }
      });
      
      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }
    }
    
    const category = await prisma.category.update({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      },
      data: {
        name,
        type
      }
    });
    
    return category;
  }
  
  async delete(id, userId) {
    // Check if category has associated transactions
    const transactionCount = await prisma.transaction.count({
      where: {
        categoryId: parseInt(id),
        userId: parseInt(userId)
      }
    });
    
    if (transactionCount > 0) {
      throw new Error('Cannot delete category with associated transactions');
    }
    
    return await prisma.category.delete({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      }
    });
  }
}

module.exports = new CategoryModel();
```

- [ ] **Step 2: Create category service**

```javascript
// src/services/category.service.js
const categoryModel = require('../models/category.model');

class CategoryService {
  async createCategory(userId, categoryData) {
    return await categoryModel.create(userId, categoryData);
  }
  
  async getCategories(userId, filters = {}) {
    return await categoryModel.findAllByUserId(userId, filters);
  }
  
  async getCategoryById(userId, categoryId) {
    return await categoryModel.findById(categoryId, userId);
  }
  
  async updateCategory(userId, categoryId, categoryData) {
    return await categoryModel.update(categoryId, userId, categoryData);
  }
  
  async deleteCategory(userId, categoryId) {
    return await categoryModel.delete(categoryId, userId);
  }
}

module.exports = new CategoryService();
```

- [ ] **Step 3: Create category validator**

```javascript
// src/utils/validators/category.validator.js
const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  type: Joi.string().valid('income', 'expense').required()
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).optional(),
  type: Joi.string().valid('income', 'expense').optional()
}).min(1); // At least one field must be provided

module.exports = {
  createCategorySchema,
  updateCategorySchema
};
```

- [ ] **Step 4: Create category controller**

```javascript
// src/controllers/category.controller.js
const categoryService = require('../services/category.service');
const { createCategorySchema, updateCategorySchema } = require('../utils/validators/category.validator');

class CategoryController {
  async createCategory(req, res) {
    try {
      // Validate input
      const { error, value } = createCategorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      
      const userId = req.user.id;
      const category = await categoryService.createCategory(userId, value);
      
      res.status(201).json({
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      if (error.message === 'Category with this name already exists') {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === 'Category type must be either "income" or "expense"') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
  
  async getCategories(req, res) {
    try {
      const userId = req.user.id;
      const filters = {};
      
      // Filter by type if provided
      if (req.query.type) {
        filters.type = req.query.type;
      }
      
      const categories = await categoryService.getCategories(userId, filters);
      
      res.status(200).json({ categories });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }
  
  async getCategoryById(req, res) {
    try {
      const userId = req.user.id;
      const categoryId = req.params.id;
      
      const category = await categoryService.getCategoryById(userId, categoryId);
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.status(200).json({ category });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  }
  
  async updateCategory(req, res) {
    try {
      // Validate input
      const { error, value } = updateCategorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      
      const userId = req.user.id;
      const categoryId = req.params.id;
      
      const category = await categoryService.updateCategory(userId, categoryId, value);
      
      res.status(200).json({
        message: 'Category updated successfully',
        category
      });
    } catch (error) {
      if (error.message === 'Category with this name already exists') {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === 'Category type must be either "income" or "expense"') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Category not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
  
  async deleteCategory(req, res) {
    try {
      const userId = req.user.id;
      const categoryId = req.params.id;
      
      await categoryService.deleteCategory(userId, categoryId);
      
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      if (error.message === 'Category not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Cannot delete category with associated transactions') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
}

module.exports = new CategoryController();
```

- [ ] **Step 5: Create category routes**

```javascript
// src/routes/category.routes.js
const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
```

- [ ] **Step 6: Register category routes in app**

```javascript
// src/app.js (add category routes)
// ... existing code ...
// Auth routes
app.use('/api/auth', require('./routes/auth.routes'));
// User routes
app.use('/api/users', require('./routes/user.routes'));
// Category routes
app.use('/api/categories', require('./routes/category.routes'));
// ... rest of the code ...
```

- [ ] **Step 7: Create category tests**

```javascript
// tests/category.test.js
const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Category Endpoints', () => {
  let token;
  let userId;
  
  beforeAll(async () => {
    // Clear test data
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    
    // Create a test user
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
    it('should create a new category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Food',
          type: 'expense'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Category created successfully');
      expect(res.body.category).toHaveProperty('id');
      expect(res.body.category.name).toBe('Food');
      expect(res.body.category.type).toBe('expense');
      expect(res.body.category.userId).toBe(userId);
    });
    
    it('should not create category with invalid type', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Invalid Type',
          type: 'invalid'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Category type must be either "income" or "expense"');
    });
    
    it('should not create duplicate category name for same user', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Travel',
          type: 'expense'
        });
      
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Travel',
          type: 'expense'
        });
      
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('error', 'Category with this name already exists');
    });
    
    it('should validate category creation data', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '', // empty name
          type: 'expense'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/categories', () => {
    it('should return user categories', async () => {
      // Create test categories
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Salary', type: 'income' });
      
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Rent', type: 'expense' });
      
      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('categories');
      expect(Array.isArray(res.body.categories)).toBe(true);
      expect(res.body.categories.length).toBeGreaterThanOrEqual(2);
    });
    
    it('should filter categories by type', async () => {
      const res = await request(app)
        .get('/api/categories?type=income')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('categories');
      expect(Array.isArray(res.body.categories)).toBe(true);
      
      // All categories should be income type
      res.body.categories.forEach(category => {
        expect(category.type).toBe('income');
      });
    });
  });
  
  describe('GET /api/categories/:id', () => {
    let categoryId;
    
    beforeAll(async () => {
      // Create a category to get its ID
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Entertainment', type: 'expense' });
      
      categoryId = res.body.category.id;
    });
    
    it('should return category by ID', async () => {
      const res = await request(app)
        .get(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('category');
      expect(res.body.category.id).toBe(categoryId);
      expect(res.body.category.name).toBe('Entertainment');
      expect(res.body.category.type).toBe('expense');
    });
    
    it('should return 404 for non-existent category', async () => {
      const res = await request(app)
        .get(`/api/categories/99999`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Category not found');
    });
    
    it('should return 404 for category belonging to another user', async () => {
      // Create another user
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123'
        });
      
      const token2 = res2.body.token;
      
      // Create category for second user
      const res3 = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token2}`)
        .send({ name: 'Private Category', type: 'expense' });
      
      const otherUserCategoryId = res3.body.category.id;
      
      // Try to access it with first user's token
      const res = await request(app)
        .get(`/api/categories/${otherUserCategoryId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Category not found');
    });
  });
  
  describe('PUT /api/categories/:id', () => {
    let categoryId;
    
    beforeAll(async () => {
      // Create a category to update
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Old Name', type: 'expense' });
      
      categoryId = res.body.category.id;
    });
    
    it('should update category', async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          type: 'income'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Category updated successfully');
      expect(res.body.category.name).toBe('Updated Name');
      expect(res.body.category.type).toBe('income');
    });
    
    it('should not update with invalid type', async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'invalid'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Category type must be either "income" or "expense"');
    });
    
    it('should not update to duplicate name', async () => {
      // Create another category
      const res2 = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Another Category', type: 'expense' });
      
      const otherCategoryId = res2.body.category.id;
      
      // Try to update first category to second category's name
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Another Category'
        });
      
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('error', 'Category with this name already exists');
    });
    
    it('should return 404 for non-existent category', async () => {
      const res = await request(app)
        .put(`/api/categories/99999`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Category not found');
    });
  });
  
  describe('DELETE /api/categories/:id', () => {
    let categoryId;
    
    beforeAll(async () => {
      // Create a category to delete
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete', type: 'expense' });
      
      categoryId = res.body.category.id;
    });
    
    it('should delete category', async () => {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Category deleted successfully');
    });
    
    it('should not delete category with associated transactions', async () => {
      // Create a category
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'With Transactions', type: 'expense' });
      
      const categoryIdWithTx = res.body.category.id;
      
      // Create a transaction associated with this category
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
          description: 'Test transaction',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: categoryIdWithTx
        });
      
      // Try to delete the category
      const res2 = await request(app)
        .delete(`/api/categories/${categoryIdWithTx}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res2.statusCode).toEqual(400);
      expect(res2.body).toHaveProperty('error', 'Cannot delete category with associated transactions');
    });
    
    it('should return 404 for non-existent category', async () => {
      const res = await request(app)
        .delete(`/api/categories/99999`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Category not found');
    });
  });
});
```

- [ ] **Step 8: Run category tests**

```bash
npm test
```

- [ ] **Step 9: Commit category management implementation**

```bash
git add .
git commit -m "feat: implement category management system with CRUD operations"
```

### Task 5: Transaction Management System

**Files:**
- Create: `src/models/transaction.model.js`
- Create: `src/services/transaction.service.js`
- Create: `src/controllers/transaction.controller.js`
- Create: `src/routes/transaction.routes.js`
- Create: `src/utils/validators/transaction.validator.js`
- Create: `tests/transaction.test.js`

- [ ] **Step 1: Create transaction model**

```javascript
// src/models/transaction.model.js
const { PrismaClient } = require('@prisma/client');
const config = require('../config/database');

const prisma = new PrismaClient();

class TransactionModel {
  async create(userId, transactionData) {
    const { amount, description, date, type, categoryId } = transactionData;
    
    // Validate type
    if (!['income', 'expense'].includes(type)) {
      throw new Error('Transaction type must be either "income" or "expense"');
    }
    
    // If categoryId is provided, verify it belongs to user
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: parseInt(categoryId),
          userId: parseInt(userId)
        }
      });
      
      if (!category) {
        throw new Error('Category not found or does not belong to user');
      }
      
      // Verify category type matches transaction type
      if (category.type !== type) {
        throw new Error('Category type must match transaction type');
      }
    }
    
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description: description || null,
        date: new Date(date),
        type,
        userId: parseInt(userId),
        categoryId: categoryId ? parseInt(categoryId) : null
      }
    });
    
    return transaction;
  }
  
  async findAllByUserId(userId, filters = {}, pagination = {}) {
    const where = {
      userId: parseInt(userId)
    };
    
    // Filter by type
    if (filters.type) {
      where.type = filters.type;
    }
    
    // Filter by date range
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }
    
    // Filter by category
    if (filters.categoryId) {
      where.categoryId = parseInt(filters.categoryId);
    }
    
    const skip = (pagination.page - 1) * pagination.limit || 0;
    const take = pagination.limit || 10;
    
    const [transactions, totalCount] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);
    
    return {
      transactions,
      pagination: {
        total: totalCount,
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        pages: Math.ceil(totalCount / (pagination.limit || 10))
      }
    };
  }
  
  async findById(id, userId) {
    return await prisma.transaction.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });
  }
  
  async update(id, userId, transactionData) {
    const { amount, description, date, type, categoryId } = transactionData;
    
    // Validate type if provided
    if (type && !['income', 'expense'].includes(type)) {
      throw new Error('Transaction type must be either "income" or "expense"');
    }
    
    // If categoryId is provided, verify it belongs to user and matches type
    if (categoryId !== undefined && categoryId !== null) {
      const category = await prisma.category.findFirst({
        where: {
          id: parseInt(categoryId),
          userId: parseInt(userId)
        }
      });
      
      if (!category) {
        throw new Error('Category not found or does not belong to user');
      }
      
      // Determine transaction type (use provided type or keep existing)
      const transactionType = type || (await this.getTypeById(id, userId));
      
      if (category.type !== transactionType) {
        throw new Error('Category type must match transaction type');
      }
    }
    
    const transaction = await prisma.transaction.update({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        description: description !== undefined ? description || null : undefined,
        date: date !== undefined ? new Date(date) : undefined,
        type: type !== undefined ? type : undefined,
        categoryId: categoryId !== undefined && categoryId !== null ? parseInt(categoryId) : null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });
    
    return transaction;
  }
  
  async getTypeById(id, userId) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      },
      select: { type: true }
    });
    
    return transaction ? transaction.type : null;
  }
  
  async delete(id, userId) {
    return await prisma.transaction.delete({
      where: {
        id: parseInt(id),
        userId: parseInt(userId)
      }
    });
  }
}

module.exports = new TransactionModel();
```

- [ ] **Step 2: Create transaction service**

```javascript
// src/services/transaction.service.js
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
```

- [ ] **Step 3: Create transaction validator**

```javascript
// src/utils/validators/transaction.validator.js
const Joi = require('joi');

const createTransactionSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  description: Joi.string().max(200).allow('', null),
  date: Joi.string().isoDate().required(),
  type: Joi.string().valid('income', 'expense').required(),
  categoryId: Joi.number().integer().positive().allow(null, '')
});

const updateTransactionSchema = Joi.object({
  amount: Joi.number().positive().precision(2),
  description: Joi.string().max(200).allow('', null),
  date: Joi.string().isoDate(),
  type: Joi.string().valid('income', 'expense'),
  categoryId: Joi.number().integer().positive().allow(null, '')
}).min(1); // At least one field must be provided

module.exports = {
  createTransactionSchema,
  updateTransactionSchema
};
```

- [ ] **Step 4: Create transaction controller**

```javascript
// src/controllers/transaction.controller.js
const transactionService = require('../services/transaction.service');
const { createTransactionSchema, updateTransactionSchema } = require('../utils/validators/transaction.validator');

class TransactionController {
  async createTransaction(req, res) {
    try {
      // Validate input
      const { error, value } = createTransactionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      
      const userId = req.user.id;
      const transaction = await transactionService.createTransaction(userId, value);
      
      res.status(201).json({
        message: 'Transaction created successfully',
        transaction
      });
    } catch (error) {
      if (error.message === 'Transaction type must be either "income" or "expense"') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Category not found or does not belong to user') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Category type must match transaction type') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }
  
  async getTransactions(req, res) {
    try {
      const userId = req.user.id;
      const filters = {};
      const pagination = {};
      
      // Filter by type
      if (req.query.type) {
        filters.type = req.query.type;
      }
      
      // Filter by date range
      if (req.query.startDate) {
        filters.startDate = req.query.startDate;
      }
      if (req.query.endDate) {
        filters.endDate = req.query.endDate;
      }
      
      // Filter by category
      if (req.query.categoryId) {
        filters.categoryId = req.query.categoryId;
      }
      
      // Pagination
      if (req.query.page) {
        pagination.page = parseInt(req.query.page);
      }
      if (req.query.limit) {
        pagination.limit = parseInt(req.query.limit);
      }
      
      const result = await transactionService.getTransactions(userId, filters, pagination);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }
  
  async getTransactionById(req, res) {
    try {
      const userId = req.user.id;
      const transactionId = req.params.id;
      
      const transaction = await transactionService.getTransactionById(userId, transactionId);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      res.status(200).json({ transaction });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  }
  
  async updateTransaction(req, res) {
    try {
      // Validate input
      const { error, value } = updateTransactionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      
      const userId = req.user.id;
      const transactionId = req.params.id;
      
      const transaction = await transactionService.updateTransaction(userId, transactionId, value);
      
      res.status(200).json({
        message: 'Transaction updated successfully',
        transaction
      });
    } catch (error) {
      if (error.message === 'Transaction type must be either "income" or "expense"') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Category not found or does not belong to user') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Category type must match transaction type') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Transaction not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  }
  
  async deleteTransaction(req, res) {
    try {
      const userId = req.user.id;
      const transactionId = req.params.id;
      
      await transactionService.deleteTransaction(userId, transactionId);
      
      res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      if (error.message === 'Transaction not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  }
}

module.exports = new TransactionController();
```

- [ ] **Step 5: Create transaction routes**

```javascript
// src/routes/transaction.routes.js
const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
```

- [ ] **Step 6: Register transaction routes in app**

```javascript
// src/app.js (add transaction routes)
// ... existing code ...
// Auth routes
app.use('/api/auth', require('./routes/auth.routes'));
// User routes
app.use('/api/users', require('./routes/user.routes'));
// Category routes
app.use('/api/categories', require('./routes/category.routes'));
// Transaction routes
app.use('/api/transactions', require('./routes/transaction.routes'));
// ... rest of the code ...
```

- [ ] **Step 7: Create transaction tests**

```javascript
// tests/transaction.test.js
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
    // Clear test data
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    
    // Create a test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123'
      });
      
    token = res.body.token;
    userId = res.body.user.id;
    
    // Create test categories
    const incomeRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Salary', type: 'income' });
      
    incomeCategoryId = incomeRes.body.category.id;
    
    const expenseRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Food', type: 'expense' });
      
    expenseCategoryId = expenseRes.body.category.id;
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  describe('POST /api/transactions', () => {
    it('should create an income transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 3000.00,
          description: 'Monthly salary',
          date: new Date().toISOString(),
          type: 'income',
          categoryId: incomeCategoryId
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Transaction created successfully');
      expect(res.body.transaction).toHaveProperty('id');
      expect(res.body.transaction.amount).toBe(3000);
      expect(res.body.transaction.type).toBe('income');
      expect(res.body.transaction.description).toBe('Monthly salary');
      expect(res.body.transaction.categoryId).toBe(incomeCategoryId);
    });
    
    it('should create an expense transaction without category', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 50.00,
          description: 'Coffee',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: null
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Transaction created successfully');
      expect(res.body.transaction.categoryId).toBeNull();
    });
    
    it('should not create transaction with invalid type', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
          description: 'Test',
          date: new Date().toISOString(),
          type: 'invalid',
          categoryId: incomeCategoryId
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Transaction type must be either "income" or "expense"');
    });
    
    it('should not create transaction with mismatched category type', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
          description: 'Test',
          date: new Date().toISOString(),
          type: 'income', // income transaction
          categoryId: expenseCategoryId // but expense category
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Category type must match transaction type');
    });
    
    it('should not create transaction with non-existent category', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
          description: 'Test',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: 99999
        });
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Category not found or does not belong to user');
    });
    
    it('should validate transaction creation data', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: -10, // negative amount
          description: 'Test',
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
      // Create a test transaction
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100.00,
          description: 'Test transaction',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: expenseCategoryId
        });
      
      transactionId = res.body.transaction.id;
    });
    
    it('should return user transactions with pagination', async () => {
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
    
    it('should filter transactions by type', async () => {
      const res = await request(app)
        .get('/api/transactions?type=expense')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('transactions');
      expect(Array.isArray(res.body.transactions)).toBe(true);
      
      // All transactions should be expense type
      res.body.transactions.forEach(transaction => {
        expect(transaction.type).toBe('expense');
      });
    });
    
    it('should filter transactions by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const res = await request(app)
        .get(`/api/transactions?startDate=${yesterday.toISOString()}&endDate=${today.toISOString()}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('transactions');
      expect(Array.isArray(res.body.transactions)).toBe(true);
      
      // All transactions should be within date range
      res.body.transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        expect(transactionDate >= yesterday && transactionDate <= today).toBe(true);
      });
    });
    
    it('should filter transactions by category', async () => {
      const res = await request(app)
        .get(`/api/transactions?categoryId=${expenseCategoryId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('transactions');
      expect(Array.isArray(res.body.transactions)).toBe(true);
      
      // All transactions should have the specified category
      res.body.transactions.forEach(transaction => {
        expect(transaction.categoryId).toBe(expenseCategoryId);
      });
    });
  });
  
  describe('GET /api/transactions/:id', () => {
    it('should return transaction by ID', async () => {
      const res = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('transaction');
      expect(res.body.transaction.id).toBe(transactionId);
      expect(res.body.transaction.amount).toBe(100);
      expect(res.body.transaction.description).toBe('Test transaction');
      expect(res.body.transaction.category).toHaveProperty('id', expenseCategoryId);
      expect(res.body.transaction.category.name).toBe('Food');
    });
    
    it('should return 404 for non-existent transaction', async () => {
      const res = await request(app)
        .get('/api/transactions/99999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Transaction not found');
    });
    
    it('should return 404 for transaction belonging to another user', async () => {
      // Create another user
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123'
        });
      
      const token2 = res2.body.token;
      
      // Create transaction for second user
      const res3 = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          amount: 50,
          description: 'Private transaction',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: expenseCategoryId
        });
      
      const otherUserTransactionId = res3.body.transaction.id;
      
      // Try to access it with first user's token
      const res = await request(app)
        .get(`/api/transactions/${otherUserTransactionId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Transaction not found');
    });
  });
  
  describe('PUT /api/transactions/:id', () => {
    it('should update transaction', async () => {
      const res = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 150.00,
          description: 'Updated transaction',
          date: new Date().toISOString(),
          type: 'expense',
          categoryId: expenseCategoryId
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Transaction updated successfully');
      expect(res.body.transaction.amount).toBe(150);
      expect(res.body.transaction.description).toBe('Updated transaction');
    });
    
    it('should not update with invalid type', async () => {
      const res = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'invalid'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Transaction type must be either "income" or "expense"');
    });
    
    it('should not update to mismatched category type', async () => {
      // Create income category
      const res2 = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bonus', type: 'income' });
      
      const incomeCategoryId = res2.body.category.id;
      
      const res = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          categoryId: incomeCategoryId
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Category type must match transaction type');
    });
    
    it('should return 404 for non-existent transaction', async () => {
      const res = await request(app)
        .put('/api/transactions/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 100 });
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Transaction not found');
    });
  });
  
  describe('DELETE /api/transactions/:id', () => {
    it('should delete transaction', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Transaction deleted successfully');
    });
    
    it('should return 404 for non-existent transaction', async () => {
      const res = await request(app)
        .delete('/api/transactions/99999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Transaction not found');
    });
  });
});
```

- [ ] **Step 8: Run transaction tests**

```bash
npm test
```

- [ ] **Step 9: Commit transaction management implementation**

```bash
git add .
git commit -m "feat: implement transaction management system with CRUD operations and filtering"
```

### Task 6: Financial Reporting System

**Files:**
- Create: `src/services/report.service.js`
- Create: `src/controllers/report.controller.js`
- Create: `src/routes/report.routes.js`
- Create: `tests/report.test.js`

- [ ] **Step 1: Create report service**

```javascript
// src/services/report.service.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class ReportService {
  async getFinancialSummary(userId, filters = {}) {
    const where = {
      userId: parseInt(userId)
    };
    
    // Filter by date range
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }
    
    // Calculate totals
    const [incomeResult, expenseResult] = await prisma.$transaction([
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: 'income'
        },
        _sum: {
          amount: true
        }
      }),
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: 'expense'
        },
        _sum: {
          amount: true
        }
      })
    ]);
    
    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpense = expenseResult._sum.amount || 0;
    const balance = totalIncome - totalExpense;
    
    return {
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpense: parseFloat(totalExpense.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
      period: {
        startDate: filters.startDate || null,
        endDate: filters.endDate || null
      }
    };
  }
  
  async getExpensesByCategory(userId, filters = {}) {
    const where = {
      userId: parseInt(userId),
      type: 'expense'
    };
    
    // Filter by date range
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }
    
    // Group by category and calculate totals
    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        amount: true
      },
      _count: true
    });
    
    // Get category details for each group
    const categoryIds = expensesByCategory
      .filter(item => item.categoryId !== null)
      .map(item => item.categoryId);
    
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        userId: parseInt(userId)
      }
    });
    
    // Map results
    const result = expensesByCategory.map(item => {
      if (item.categoryId === null) {
        return {
          category: { id: null, name: 'Uncategorized', type: 'expense' },
          total: parseFloat((item._sum.amount || 0).toFixed(2)),
          transactionCount: item._count
        };
      }
      
      const category = categories.find(cat => cat.id === item.categoryId);
      if (!category) {
        return null;
      }
      
      return {
        category: {
          id: category.id,
          name: category.name,
          type: category.type
        },
        total: parseFloat((item._sum.amount || 0).toFixed(2)),
        transactionCount: item._count
      };
    }).filter(Boolean); // Remove null entries
    
    // Calculate total for percentage calculation
    const totalExpenses = result.reduce((sum, item) => sum + item.total, 0);
    
    // Add percentage to each category
    const resultWithPercentage = result.map(item => ({
      ...item,
      percentage: totalExpenses > 0 ? parseFloat(((item.total / totalExpenses) * 100).toFixed(2)) : 0
    }));
    
    // Sort by amount descending
    return resultWithPercentage.sort((a, b) => b.total - a.total);
  }
}

module.exports = new ReportService();
```

- [ ] **Step 2: Create report controller**

```javascript
// src/controllers/report.controller.js
const reportService = require('../services/report.service');

class ReportController {
  async getFinancialSummary(req, res) {
    try {
      const userId = req.user.id;
      const filters = {};
      
      if (req.query.startDate) {
        filters.startDate = req.query.startDate;
      }
      if (req.query.endDate) {
        filters.endDate = req.query.endDate;
      }
      
      const summary = await reportService.getFinancialSummary(userId, filters);
      
      res.status(200).json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate financial summary' });
    }
  }
  
  async getExpensesByCategory(req, res) {
    try {
      const userId = req.user.id;
      const filters = {};
      
      if (req.query.startDate) {
        filters.startDate = req.query.startDate;
      }
      if (req.query.endDate) {
        filters.endDate = req.query.endDate;
      }
      
      const expensesByCategory = await reportService.getExpensesByCategory(userId, filters);
      
      res.status(200).json(expensesByCategory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate expenses by category report' });
    }
  }
}

module.exports = new ReportController();
```

- [ ] **Step 3: Create report routes**

```javascript
// src/routes/report.routes.js
const express = require('express');
const reportController = require('../controllers/report.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/summary', reportController.getFinancialSummary);
router.get('/by-category', reportController.getExpensesByCategory);

module.exports = router;
```

- [ ] **Step 4: Register report routes in app**

```javascript
// src/app.js (add report routes)
// ... existing code ...
// Auth routes
app.use('/api/auth', require('./routes/auth.routes'));
// User routes
app.use('/api/users', require('./routes/user.routes'));
// Category routes
app.use('/api/categories', require('./routes/category.routes'));
// Transaction routes
app.use('/api/transactions', require('./routes/transaction.routes'));
// Report routes
app.use('/api/reports', require('./routes/report.routes'));
// ... rest of the code ...
```

- [ ] **Step 5: Create report tests**

```javascript
// tests/report.test.js
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
    // Clear test data
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    
    // Create a test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123'
      });
      
    token = res.body.token;
    userId = res.body.user.id;
    
    // Create test categories
    const foodRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Food', type: 'expense' });
      
    foodCategoryId = foodRes.body.category.id;
    
    const transportRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Transport', type: 'expense' });
      
    transportCategoryId = transportRes.body.category.id;
    
    const salaryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Salary', type: 'income' });
      
    salaryCategoryId = salaryRes.body.category.id;
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  describe('GET /api/reports/summary', () => {
    beforeAll(async () => {
      // Clear transactions for clean test state
      await prisma.transaction.deleteMany({ where: { userId } });
      
      // Create test transactions
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 3000.00,
          description: 'Monthly salary',
          date: '2026-01-15T00:00:00.000Z',
          type: 'income',
          categoryId: salaryCategoryId
        });
      
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 500.00,
          description: 'Freelance income',
          date: '2026-01-20T00:00:00.000Z',
          type: 'income',
          categoryId: salaryCategoryId
        });
      
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 300.00,
          description: 'Groceries',
          date: '2026-01-10T00:00:00.000Z',
          type: 'expense',
          categoryId: foodCategoryId
        });
      
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 150.00,
          description: 'Gas',
          date: '2026-01-15T00:00:00.000Z',
          type: 'expense',
          categoryId: transportCategoryId
        });
      
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 75.00,
          description: 'Coffee',
          date: '2026-02-05T00:00:00.000Z',
          type: 'expense',
          categoryId: foodCategoryId
        });
    });
    
    it('should return financial summary for all time', async () => {
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
    
    it('should return financial summary for date range', async () => {
      const res = await request(app)
        .get('/api/reports/summary?startDate=2026-01-01&endDate=2026-01-31')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('totalIncome', 3500.00);
      expect(res.body).toHaveProperty('totalExpense', 450.00); // Only Jan expenses
      expect(res.body).toHaveProperty('balance', 3050.00);
      expect(res.body).toHaveProperty('period');
      expect(res.body.period.startDate).toBe('2026-01-01');
      expect(res.body.period.endDate).toBe('2026-01-31');
    });
    
    it('should return financial summary with no transactions', async () => {
      // Create a new user with no transactions
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User No Transactions',
          email: 'no-transactions@example.com',
          password: 'password123'
        });
      
      const token2 = res2.body.token;
      const userId2 = res2.body.user.id;
      
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
      // Clear transactions for clean test state
      await prisma.transaction.deleteMany({ where: { userId } });
      
      // Create test transactions for February
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 200.00,
          description: 'Groceries week 1',
          date: '2026-02-05T00:00:00.000Z',
          type: 'expense',
          categoryId: foodCategoryId
        });
      
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 150.00,
          description: 'Restaurant',
          date: '2026-02-12T00:00:00.000Z',
          type: 'expense',
          categoryId: foodCategoryId
        });
      
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100.00,
          description: 'Gas',
          date: '2026-02-10T00:00:00.000Z',
          type: 'expense',
          categoryId: transportCategoryId
        });
      
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 50.00,
          description: 'Bus fare',
          date: '2026-02-15T00:00:00.000Z',
          type: 'expense',
          categoryId: transportCategoryId
        });
    });
    
    it('should return expenses by category for all time', async () => {
      const res = await request(app)
        .get('/api/reports/by-category')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // Should have Food and Transport categories
      const foodCategory = res.body.find(item => item.category.name === 'Food');
      const transportCategory = res.body.find(item => item.category.name === 'Transport');
      
      expect(foodCategory).toBeDefined();
      expect(foodCategory.total).toBe(500.00); // 300 + 200
      expect(foodCategory.transactionCount).toBe(2);
      expect(foodCategory.percentage).toBeCloseTo(66.67); // 500/(500+150) * 100
      
      expect(transportCategory).toBeDefined();
      expect(transportCategory.total).toBe(150.00); // 100 + 50
      expect(transportCategory.transactionCount).toBe(2);
      expect(transportCategory.percentage).toBeCloseTo(33.33); // 150/(500+150) * 100
    });
    
    it('should return expenses by category for date range', async () => {
      const res = await request(app)
        .get('/api/reports/by-category?startDate=2026-02-01&endDate=2026-02-28')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // Should have Food and Transport categories (only February transactions)
      const foodCategory = res.body.find(item => item.category.name === 'Food');
      const transportCategory = res.body.find(item => item.category.name === 'Transport');
      
      expect(foodCategory).toBeDefined();
      expect(foodCategory.total).toBe(350.00); // 200 + 150
      expect(foodCategory.transactionCount).toBe(2);
      
      expect(transportCategory).toBeDefined();
      expect(transportCategory.total).toBe(150.00); // 100 + 50
      expect(transportCategory.transactionCount).toBe(2);
    });
    
    it('should return empty array when no expenses', async () => {
      // Create a new user with only income
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Income Only User',
          email: 'income-only@example.com',
          password: 'password123'
        });
      
      const token2 = res2.body.token;
      
      // Add income transaction
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          amount: 1000.00,
          description: 'Salary',
          date: '2026-01-15T00:00:00.000Z',
          type: 'income',
          categoryId: salaryCategoryId
        });
      
      const res = await request(app)
        .get('/api/reports/by-category')
        .set('Authorization', `Bearer ${token2}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0); // No expenses
    });
  });
});
```

- [ ] **Step 6: Run report tests**

```bash
npm test
```

- [ ] **Step 7: Commit financial reporting implementation**

```bash
git add .
git commit -m "feat: implement financial reporting system with summary and category reports"
```

### Task 7: API Documentation and Testing

**Files:**
- Create: `docs/API.md`
- Create: `tests/setup.js`
- Create: `tests/teardown.js`

- [ ] **Step 1: Create API documentation**

```markdown
# CoinTrack API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints except `/auth/register` and `/auth/login` require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user and get JWT token
- `GET /auth/me` - Get current user profile (requires auth)

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `DELETE /users/me` - Delete current user account

### Categories
- `GET /categories` - Get all categories for current user
- `POST /categories` - Create a new category
- `GET /categories/:id` - Get a specific category
- `PUT /categories/:id` - Update a specific category
- `DELETE /categories/:id` - Delete a specific category

### Transactions
- `GET /transactions` - Get all transactions for current user (with filtering and pagination)
- `POST /transactions` - Create a new transaction
- `GET /transactions/:id` - Get a specific transaction
- `PUT /transactions/:id` - Update a specific transaction
- `DELETE /transactions/:id` - Delete a specific transaction

### Reports
- `GET /reports/summary` - Get financial summary (total income, expense, balance)
- `GET /reports/by-category` - Get expenses grouped by category

## Query Parameters

### Transactions Filtering
- `type`: Filter by transaction type (`income` or `expense`)
- `startDate`: Filter transactions from this date (ISO format)
- `endDate`: Filter transactions to this date (ISO format)
- `categoryId`: Filter by category ID

### Transactions Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Reports Filtering
- `startDate`: Filter from this date (ISO format)
- `endDate`: Filter to this date (ISO format)

## Response Format

### Success Responses
```json
{
  "message": "Success message",
  "data": {}
}
```

### Error Responses
```json
{
  "error": "Error message"
}
```

### Pagination Response
```json
{
  "transactions": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## Data Types

### User
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Category
```json
{
  "id": 1,
  "name": "Food",
  "type": "expense",
  "userId": 1,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Transaction
```json
{
  "id": 1,
  "amount": 25.50,
  "description": "Lunch at restaurant",
  "date": "2023-01-15T00:00:00.000Z",
  "type": "expense",
  "userId": 1,
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Food",
    "type": "expense"
  },
  "createdAt": "2023-01-15T00:00:00.000Z",
  "updatedAt": "2023-01-15T00:00:00.000Z"
}
```

## Error Codes
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing or invalid token
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists (e.g., duplicate email)
- `500`: Internal Server Error - Unexpected server error
```

- [ ] **Step 2: Create test setup file**

```javascript
// tests/setup.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTestDatabase() {
  try {
    // Clear all test data
    await prisma.transaction.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('Test database cleaned successfully');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

module.exports = { setupTestDatabase };
```

- [ ] **Step 3: Create test teardown file**

```javascript
// tests/teardown.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function teardownTestDatabase() {
  try {
    // Clean up after tests
    await prisma.transaction.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    
    await prisma.$disconnect();
    
    console.log('Test database cleaned up successfully');
  } catch (error) {
    console.error('Error tearing down test database:', error);
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
    throw error;
  }
}

module.exports = { teardownTestDatabase };
```

- [ ] **Step 4: Update package.json test scripts**

```json
// package.json (update test scripts)
{
  "scripts": {
    "test": "jest --detectOpenHandles --forceExit",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

- [ ] **Step 5: Create Jest configuration**

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  teardown: './tests/teardown.js',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.config.js',
    '!src/server.js'
  ]
};
```

- [ ] **Step 6: Run all tests to ensure everything works**

```bash
npm test
```

- [ ] **Step 7: Commit documentation and testing setup**

```bash
git add .
git commit -m "feat: add API documentation and complete testing setup"
```

### Task 8: Final Application Setup and Validation

**Files:**
- Create: `src/utils/helpers.js`
- Update: `package.json` (add start scripts)
- Create: `Dockerfile` (optional, for containerization)
- Create: `.dockerignore` (optional)

- [ ] **Step 1: Create utility helpers**

```javascript
// src/utils/helpers.js
/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

/**
 * Format date to local string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Validate UUID format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid UUID format
 */
function isValidId(id) {
  return !isNaN(parseInt(id)) && parseInt(id) > 0;
}

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result
 */
function paginateArray(array, page = 1, limit = 10) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      total: array.length,
      page,
      limit,
      pages: Math.ceil(array.length / limit)
    }
  };
}

module.exports = {
  formatCurrency,
  formatDate,
  isValidId,
  paginateArray
};
```

- [ ] **Step 2: Update package.json with startup instructions**

```json
// package.json (add keywords and author)
{
  "name": "cointrack-backend",
  "version": "1.0.0",
  "description": "Backend for CoinTrack personal finance app - A complete financial tracking system with user authentication, transaction management, categorization, and reporting",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --detectOpenHandles --forceExit",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "keywords": [
    "finance",
    "expense-tracker",
    "budget",
    "personal-finance",
    "nodejs",
    "express",
    "postgresql",
    "prisma",
    "jwt",
    "rest-api"
  ],
  "author": "CoinTrack Development Team",
  "license": "MIT",
  // ... rest of the file ...
}
```

- [ ] **Step 3: Create Dockerfile (optional)**

```dockerfile
# Dockerfile
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

- [ ] **Step 4: Create .dockerignore (optional)**

```dockerfile
# .dockerignore
node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.gitignore
.env
.env.*
coverage
docs
tests
```

- [ ] **Step 5: Final application test**

```bash
# Start the application in development mode
npm run dev

# In another terminal, run tests
npm test

# Or run a quick manual test
curl http://localhost:3000/health
```

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete application setup with utilities, documentation, and final validation"
```

### Summary

This implementation plan covers all the required functionality for the CoinTrack backend:

1. **Project Setup** - Initial configuration with Express, Prisma, PostgreSQL
2. **Authentication System** - JWT-based auth with bcrypt password hashing
3. **User Management** - Profile CRUD operations
4. **Category Management** - Income/expense categorization with validation
5. **Transaction Management** - Full CRUD with filtering and pagination
6. **Financial Reporting** - Summary reports and category-based expense analysis
7. **Documentation & Testing** - Complete API documentation and test suite

Each task follows TDD principles with tests written before implementation, ensuring robust and maintainable code. The application follows MVC architecture with clear separation of concerns and proper error handling.

To run the application:
1. Copy `.env.example` to `.env` and configure database connection
2. Run `npm install` to install dependencies
3. Run `npx prisma migrate dev` to set up the database
4. Run `npm run dev` to start the development server
5. Run `npm test` to execute the test suite

The API will be available at `http://localhost:3000/api` with full documentation available in `docs/API.md`.