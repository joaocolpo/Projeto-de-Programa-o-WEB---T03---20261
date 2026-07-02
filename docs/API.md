# CoinTrack Backend API Documentation

## Overview

This document describes the RESTful API for the CoinTrack personal finance backend application.

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API uses JSON Web Tokens (JWT) for authentication. Except for the authentication endpoints (`/api/auth/register` and `/api/auth/login`), all other endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

---

## Endpoints

### Authentication

#### Register a new user
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string (email)",
  "password": "string (min 6 characters)"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "createdAt": "2026-07-02T00:00:00.000Z",
    "updatedAt": "2026-07-02T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","email":"joao@example.com","password":"senha123"}'
```

#### Login user
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "string (email)",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "createdAt": "2026-07-02T00:00:00.000Z",
    "updatedAt": "2026-07-02T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"senha123"}'
```

#### Get current user profile
```
GET /api/auth/me
```
*Requires authentication*

**curl:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

---

### Users

All user endpoints require authentication.

#### Get user profile
```
GET /api/users/me
```

**curl:**
```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <token>"
```

#### Update user profile
```
PUT /api/users/me
```

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (email, optional)"
}
```

**curl:**
```bash
curl -X PUT http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"João Atualizado"}'
```

#### Delete user account
```
DELETE /api/users/me
```

**curl:**
```bash
curl -X DELETE http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <token>"
```

---

### Categories

All category endpoints require authentication.

#### Create a new category
```
POST /api/categories
```

**Request Body:**
```json
{
  "name": "string",
  "type": "income | expense"
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Alimentação","type":"expense"}'
```

#### Get all categories
```
GET /api/categories?type=income|expense
```

**curl:**
```bash
# All categories
curl http://localhost:3000/api/categories \
  -H "Authorization: Bearer <token>"

# Filter by type
curl "http://localhost:3000/api/categories?type=expense" \
  -H "Authorization: Bearer <token>"
```

#### Get category by ID
```
GET /api/categories/:id
```

**curl:**
```bash
curl http://localhost:3000/api/categories/1 \
  -H "Authorization: Bearer <token>"
```

#### Update category
```
PUT /api/categories/:id
```

**curl:**
```bash
curl -X PUT http://localhost:3000/api/categories/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Alimentação e Bebidas"}'
```

#### Delete category
```
DELETE /api/categories/:id
```

**curl:**
```bash
curl -X DELETE http://localhost:3000/api/categories/1 \
  -H "Authorization: Bearer <token>"
```

---

### Transactions

All transaction endpoints require authentication.

#### Create a new transaction
```
POST /api/transactions
```

**Request Body:**
```json
{
  "amount": 150.50,
  "description": "string (optional)",
  "date": "2026-07-02",
  "type": "income | expense",
  "categoryId": 1
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"amount":150.50,"description":"Supermercado","date":"2026-07-02","type":"expense","categoryId":1}'
```

#### Get all transactions (with pagination and filtering)
```
GET /api/transactions?page=1&limit=10&type=income|expense&startDate=2026-01-01&endDate=2026-12-31&categoryId=1
```

**curl:**
```bash
# All transactions (paginated)
curl "http://localhost:3000/api/transactions?page=1&limit=10" \
  -H "Authorization: Bearer <token>"

# Filter by type and date range
curl "http://localhost:3000/api/transactions?type=expense&startDate=2026-01-01&endDate=2026-06-30" \
  -H "Authorization: Bearer <token>"
```

#### Get transaction by ID
```
GET /api/transactions/:id
```

**curl:**
```bash
curl http://localhost:3000/api/transactions/1 \
  -H "Authorization: Bearer <token>"
```

#### Update transaction
```
PUT /api/transactions/:id
```

**curl:**
```bash
curl -X PUT http://localhost:3000/api/transactions/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"amount":200.00,"description":"Supermercado atualizado"}'
```

#### Delete transaction
```
DELETE /api/transactions/:id
```

**curl:**
```bash
curl -X DELETE http://localhost:3000/api/transactions/1 \
  -H "Authorization: Bearer <token>"
```

---

### Reports

All report endpoints require authentication.

#### Get financial summary
```
GET /api/reports/summary?startDate=2026-01-01&endDate=2026-12-31
```

Returns total income, total expenses, and balance for the given period.

**Success Response (200):**
```json
{
  "totalIncome": 5000.00,
  "totalExpense": 3200.50,
  "balance": 1799.50,
  "period": {
    "startDate": "2026-01-01",
    "endDate": "2026-12-31"
  }
}
```

**curl:**
```bash
# Full summary
curl http://localhost:3000/api/reports/summary \
  -H "Authorization: Bearer <token>"

# Filtered by period
curl "http://localhost:3000/api/reports/summary?startDate=2026-01-01&endDate=2026-06-30" \
  -H "Authorization: Bearer <token>"
```

#### Get expenses by category
```
GET /api/reports/by-category?startDate=2026-01-01&endDate=2026-12-31
```

Returns expenses grouped by category with totals and percentages.

**Success Response (200):**
```json
[
  {
    "category": {
      "id": 1,
      "name": "Alimentação",
      "type": "expense"
    },
    "total": 1500.00,
    "transactionCount": 15,
    "percentage": 46.87
  },
  {
    "category": {
      "id": 2,
      "name": "Transporte",
      "type": "expense"
    },
    "total": 800.00,
    "transactionCount": 8,
    "percentage": 25.00
  }
]
```

**curl:**
```bash
curl "http://localhost:3000/api/reports/by-category?startDate=2026-01-01&endDate=2026-06-30" \
  -H "Authorization: Bearer <token>"
```

#### Get expenses by period
```
GET /api/reports/by-period?startDate=2026-01-01&endDate=2026-12-31&groupBy=month
```

Returns expenses grouped by time period (day, week, or month).

**Query Parameters:**
- `startDate`: Optional start date (YYYY-MM-DD)
- `endDate`: Optional end date (YYYY-MM-DD)
- `groupBy`: Grouping interval — `day`, `week`, or `month` (default: `month`)

**Success Response (200):**
```json
[
  {
    "period": "2026-01",
    "total": 1200.50,
    "transactionCount": 12
  },
  {
    "period": "2026-02",
    "total": 980.00,
    "transactionCount": 9
  }
]
```

**curl:**
```bash
# Monthly grouping (default)
curl "http://localhost:3000/api/reports/by-period?startDate=2026-01-01&endDate=2026-06-30" \
  -H "Authorization: Bearer <token>"

# Daily grouping
curl "http://localhost:3000/api/reports/by-period?startDate=2026-07-01&endDate=2026-07-31&groupBy=day" \
  -H "Authorization: Bearer <token>"
```

---

## Data Types

| Field       | Type    | Details                                      |
|-------------|---------|----------------------------------------------|
| id          | Integer | Auto-incrementing                            |
| name        | String  | Max 100 characters                           |
| email       | String  | Valid email format, unique                    |
| password    | String  | Min 6 characters, hashed with bcrypt         |
| amount      | Decimal | Precision 10, scale 2                        |
| description | String  | Optional, max 255 characters                 |
| date        | DateTime| ISO 8601 format (YYYY-MM-DD)                 |
| type        | String  | Either "income" or "expense"                 |
| userId      | Integer | Foreign key to User                          |
| categoryId  | Integer | Foreign key to Category, nullable            |

## Security

- Passwords are hashed using bcrypt before storage
- JWT tokens are signed with a secret key stored in environment variables
- All endpoints (except auth) require authentication
- Data is isolated by user ID — users can only access their own data
- Input validation is performed using Joi schemas
