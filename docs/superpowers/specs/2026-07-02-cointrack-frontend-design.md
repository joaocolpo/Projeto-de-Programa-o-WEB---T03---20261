# CoinTrack Frontend - Design Spec

## Overview

Frontend web em React para o sistema CoinTrack de controle financeiro pessoal. Consome a API backend existente (Express + Prisma + PostgreSQL) na porta 3000.

**Stack:** React (Vite) + React Router + Axios + Recharts + CSS Modules

## Estrutura de Pastas

```
Trabalho Final/
├── backend/              # codigo backend atual movido para ca
│   ├── src/
│   ├── prisma/
│   ├── tests/
│   ├── jest.config.js
│   ├── package.json
│   └── .env
└── frontend/             # novo projeto React (Vite)
    ├── public/
    ├── src/
    │   ├── components/   # componentes reutilizaveis
    │   ├── pages/        # paginas/telas
    │   ├── services/     # api.js (axios), auth helpers
    │   ├── contexts/     # AuthContext
    │   ├── hooks/        # useAuth, useApi
    │   ├── styles/       # variaveis CSS globais
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## API Backend (Endpoints Existentes)

### Auth (publicas)
- `POST /api/auth/register` - body: `{name, email, password}` -> `{user, token}`
- `POST /api/auth/login` - body: `{email, password}` -> `{user, token}`
- `GET /api/auth/me` - header: Bearer token -> `{user}`

### Users (protegidas)
- `GET /api/users/me` -> perfil do usuario
- `PUT /api/users/me` -> atualizar perfil
- `DELETE /api/users/me` -> excluir conta

### Categories (protegidas)
- `POST /api/categories` - body: `{name, type}` (type: "income" | "expense")
- `GET /api/categories` - query: `?type=income|expense`
- `GET /api/categories/:id`
- `PUT /api/categories/:id` - body: `{name?, type?}`
- `DELETE /api/categories/:id`

### Transactions (protegidas)
- `POST /api/transactions` - body: `{amount, description?, date, type, categoryId?}`
- `GET /api/transactions` - query: `?type=&startDate=&endDate=&categoryId=&page=&limit=`
- `GET /api/transactions/:id`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Reports (protegidas)
- `GET /api/reports/summary?startDate=&endDate=` -> `{totalIncome, totalExpense, balance}`
- `GET /api/reports/by-category?startDate=&endDate=` -> gastos por categoria
- `GET /api/reports/by-period?startDate=&endDate=&groupBy=` -> gastos por periodo

## Arquitetura Frontend

### Autenticacao
- `AuthContext` gerencia estado do usuario logado e token JWT
- Token armazenado em `localStorage` para persistencia entre sessoes
- Modulo `api.js` usa Axios com interceptor que:
  - Injeta `Authorization: Bearer <token>` em todas as requests
  - Em resposta 401, faz logout automatico e redireciona para `/login`
- Componente `PrivateRoute` protege rotas que exigem login

### Rotas
| Rota | Componente | Acesso |
|------|-----------|--------|
| `/login` | LoginPage | Publica |
| `/register` | RegisterPage | Publica |
| `/` | Dashboard | Protegida |
| `/transactions` | TransactionsPage | Protegida |
| `/categories` | CategoriesPage | Protegida |
| `/reports` | ReportsPage | Protegida |

### Layout
- Paginas protegidas usam componente `Layout` com:
  - **Sidebar** fixa a esquerda: logo, links de navegacao, nome do usuario, botao logout
  - **Area de conteudo** a direita
- Responsivo: em telas < 768px a sidebar vira menu hamburger no topo

## Telas

### Login
- Card centralizado com logo "CoinTrack"
- Campos: email, senha
- Botao "Entrar"
- Link "Criar conta" -> `/register`
- Validacao inline, erros da API exibidos no formulario

### Cadastro
- Card centralizado com logo "CoinTrack"
- Campos: nome, email, senha, confirmar senha
- Botao "Cadastrar"
- Link "Ja tenho conta" -> `/login`
- Validacao: email valido, senha minima 6 chars, senhas iguais

### Dashboard
- **3 cards resumo** no topo:
  - Receitas (verde, icone seta pra cima)
  - Despesas (vermelho, icone seta pra baixo)
  - Saldo (azul se positivo, vermelho se negativo)
- **Filtro de periodo**: seletor de mes (mes atual por padrao)
- **Grafico pizza** (Recharts PieChart): gastos por categoria
- **Ultimas 5 transacoes**: lista compacta com link "Ver todas"

### Transacoes
- **Filtros**: tipo (todos/receita/despesa), categoria (dropdown), periodo (date pickers)
- **Botao "Nova Transacao"**: abre modal
- **Tabela**: colunas Data, Descricao, Categoria, Tipo (tag verde/vermelha), Valor
- **Paginacao** no rodape da tabela
- **Acoes por linha**: editar (abre modal preenchido), excluir (dialog de confirmacao)
- **Modal de transacao**: campos amount, description, date, type (radio), category (dropdown filtrado por type)

### Categorias
- **Grid de cards**: cada card mostra nome, tipo (tag), contagem de transacoes
- **Botao "Nova Categoria"**: abre modal
- **Modal**: campos nome, tipo (radio: receita/despesa)
- **Acoes por card**: editar, excluir (com confirmacao)

### Relatorios
- **Seletor de periodo** (date range picker)
- **Grafico pizza** (PieChart): gastos por categoria com legenda
- **Grafico barras** (BarChart): receitas vs despesas por mes
- **Grafico linhas** (LineChart): evolucao do saldo ao longo do tempo

## Componentes Reutilizaveis

| Componente | Props principais | Uso |
|-----------|-----------------|-----|
| `Layout` | `children` | Wrapper sidebar + conteudo |
| `Sidebar` | - | Navegacao, usuario, logout |
| `PrivateRoute` | `children` | Protecao de rotas |
| `SummaryCard` | `title, value, color, icon` | Cards do dashboard |
| `Modal` | `isOpen, onClose, title, children` | Formularios criar/editar |
| `DataTable` | `columns, data, pagination, onPageChange` | Tabela com paginacao |
| `FilterBar` | `filters, onFilterChange` | Filtros de transacoes |
| `ConfirmDialog` | `message, onConfirm, onCancel` | Confirmacao de exclusao |
| `LoadingSpinner` | - | Indicador de carregamento |
| `Alert` | `type, message` | Mensagens sucesso/erro |

## Estilo Visual

### Paleta
- Fundo geral: `#f5f7fa`
- Cards/Sidebar: `#ffffff` com `box-shadow: 0 1px 3px rgba(0,0,0,0.1)`
- Primaria: `#2563eb` (azul)
- Receita: `#16a34a` (verde)
- Despesa: `#dc2626` (vermelho)
- Saldo positivo: `#2563eb` / Saldo negativo: `#dc2626`
- Texto principal: `#1e293b`
- Texto secundario: `#64748b`
- Borda: `#e2e8f0`

### Tipografia
- Fonte: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Titulos: 600 weight
- Corpo: 400 weight, 14-16px

### Espacamento
- Padding de pagina: 24px
- Gap entre cards: 16px
- Border-radius: 8px (cards), 6px (inputs/botoes)

## Dependencias Frontend

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "axios": "^1",
    "recharts": "^2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4",
    "vite": "^5"
  }
}
```

## Configuracao Vite

- Proxy de desenvolvimento: requests `/api/*` redirecionadas para `http://localhost:3000`
- Isso evita problemas de CORS durante desenvolvimento
