# CoinTrack Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React frontend for the CoinTrack personal finance app that integrates with the existing Express/Prisma backend API.

**Architecture:** Single-page React app (Vite) with React Router for navigation. AuthContext manages JWT auth state. Axios with interceptors handles all API calls through a Vite dev proxy. CSS Modules for scoped styling with a shared variables file for the design system.

**Tech Stack:** React 18, Vite 5, React Router 6, Axios, Recharts, CSS Modules

**Spec:** `docs/superpowers/specs/2026-07-02-cointrack-frontend-design.md`

---

## File Structure

```
Trabalho Final/
├── backend/                          # existing code moved here
│   ├── src/                          # unchanged
│   ├── prisma/                       # unchanged
│   ├── tests/                        # unchanged
│   ├── jest.config.js                # unchanged
│   ├── package.json                  # unchanged
│   └── .env                          # unchanged
├── frontend/
│   ├── index.html                    # Vite entry HTML
│   ├── vite.config.js                # Vite config with /api proxy
│   ├── package.json                  # React deps
│   └── src/
│       ├── main.jsx                  # ReactDOM.createRoot entry
│       ├── App.jsx                   # Router setup
│       ├── styles/
│       │   └── variables.css         # CSS custom properties (palette, spacing, typography)
│       ├── services/
│       │   └── api.js                # Axios instance with JWT interceptor
│       ├── contexts/
│       │   └── AuthContext.jsx       # Auth state, login/logout/register, token persistence
│       ├── hooks/
│       │   └── useAuth.js            # Shortcut to useContext(AuthContext)
│       ├── components/
│       │   ├── Layout/
│       │   │   ├── Layout.jsx        # Sidebar + content wrapper
│       │   │   └── Layout.module.css
│       │   ├── Sidebar/
│       │   │   ├── Sidebar.jsx       # Nav links, user info, logout, hamburger toggle
│       │   │   └── Sidebar.module.css
│       │   ├── PrivateRoute.jsx      # Redirect to /login if not authenticated
│       │   ├── SummaryCard/
│       │   │   ├── SummaryCard.jsx   # title, value, color, icon
│       │   │   └── SummaryCard.module.css
│       │   ├── Modal/
│       │   │   ├── Modal.jsx         # Overlay + card, isOpen/onClose/title/children
│       │   │   └── Modal.module.css
│       │   ├── ConfirmDialog/
│       │   │   ├── ConfirmDialog.jsx # Confirm/cancel with message
│       │   │   └── ConfirmDialog.module.css
│       │   ├── LoadingSpinner/
│       │   │   ├── LoadingSpinner.jsx
│       │   │   └── LoadingSpinner.module.css
│       │   └── Alert/
│       │       ├── Alert.jsx         # type (success/error), message, auto-dismiss
│       │       └── Alert.module.css
│       └── pages/
│           ├── Login/
│           │   ├── LoginPage.jsx
│           │   └── LoginPage.module.css
│           ├── Register/
│           │   ├── RegisterPage.jsx
│           │   └── RegisterPage.module.css
│           ├── Dashboard/
│           │   ├── DashboardPage.jsx
│           │   └── DashboardPage.module.css
│           ├── Transactions/
│           │   ├── TransactionsPage.jsx
│           │   ├── TransactionsPage.module.css
│           │   ├── TransactionModal.jsx
│           │   └── TransactionModal.module.css
│           ├── Categories/
│           │   ├── CategoriesPage.jsx
│           │   ├── CategoriesPage.module.css
│           │   ├── CategoryModal.jsx
│           │   └── CategoryModal.module.css
│           └── Reports/
│               ├── ReportsPage.jsx
│               └── ReportsPage.module.css
├── docs/
└── .gitignore
```

---

### Task 1: Reorganize project — move backend into `backend/` subdirectory

**Files:**
- Move: all current root files (`src/`, `prisma/`, `tests/`, `jest.config.js`, `package.json`, `package-lock.json`, `.env`, `.env.example`, `node_modules/`) into `backend/`
- Modify: `.gitignore` at project root to cover both backend and frontend

- [ ] **Step 1: Move backend files into `backend/` directory**

```bash
cd "/home/tobot/Trabalho Final"
mkdir -p backend
mv src prisma tests jest.config.js package.json package-lock.json .env .env.example backend/
mv node_modules backend/
```

- [ ] **Step 2: Update root `.gitignore` to cover both projects**

Replace `.gitignore` at project root with:

```gitignore
# Dependencies
node_modules/
package-lock.json

# Environment
.env
.env.local
.env.*.local

# Prisma SQL
prisma/*.sql
prisma/**/*.sql

# Logs
logs
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build output
dist/
```

- [ ] **Step 3: Verify backend still works from new location**

```bash
cd "/home/tobot/Trabalho Final/backend"
npm install
node -e "const app = require('./src/app'); console.log('Backend OK');"
```

Expected: prints `Backend OK` with no errors.

- [ ] **Step 4: Commit**

```bash
cd "/home/tobot/Trabalho Final"
git add -A
git commit -m "refactor: move backend into backend/ subdirectory"
```

---

### Task 2: Scaffold frontend React project with Vite

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/index.html`
- Create: `frontend/vite.config.js`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/styles/variables.css`

- [ ] **Step 1: Create frontend project with Vite**

```bash
cd "/home/tobot/Trabalho Final"
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom axios recharts
```

- [ ] **Step 2: Clean up Vite boilerplate**

Delete these generated files that we don't need:
- `frontend/src/App.css`
- `frontend/src/index.css`
- `frontend/src/assets/react.svg`
- `frontend/public/vite.svg`

- [ ] **Step 3: Create `frontend/src/styles/variables.css`**

```css
:root {
  --color-bg: #f5f7fa;
  --color-surface: #ffffff;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-income: #16a34a;
  --color-income-bg: #f0fdf4;
  --color-expense: #dc2626;
  --color-expense-bg: #fef2f2;
  --color-text: #1e293b;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  --color-shadow: rgba(0, 0, 0, 0.1);

  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-weight-normal: 400;
  --font-weight-semibold: 600;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  --shadow-sm: 0 1px 3px var(--color-shadow);
  --shadow-md: 0 4px 6px var(--color-shadow);

  --sidebar-width: 250px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  font-size: 14px;
  color: var(--color-text);
  background-color: var(--color-bg);
  line-height: 1.5;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input, select, textarea {
  font-family: inherit;
  font-size: inherit;
}
```

- [ ] **Step 4: Write `frontend/src/main.jsx`**

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/variables.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

- [ ] **Step 5: Write `frontend/src/App.jsx`** (placeholder with routes)

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<p>Login</p>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
```

- [ ] **Step 6: Configure Vite proxy in `frontend/vite.config.js`**

Replace the generated file with:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 7: Verify frontend starts**

```bash
cd "/home/tobot/Trabalho Final/frontend"
npm run dev -- --host &
sleep 3
curl -s http://localhost:5173 | head -5
kill %1
```

Expected: HTML response with React root div.

- [ ] **Step 8: Commit**

```bash
cd "/home/tobot/Trabalho Final"
git add frontend/
git commit -m "feat: scaffold frontend React project with Vite"
```

---

### Task 3: API service layer and Auth context

**Files:**
- Create: `frontend/src/services/api.js`
- Create: `frontend/src/contexts/AuthContext.jsx`
- Create: `frontend/src/hooks/useAuth.js`
- Create: `frontend/src/components/PrivateRoute.jsx`

- [ ] **Step 1: Create `frontend/src/services/api.js`**

```jsx
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cointrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cointrack_token');
      localStorage.removeItem('cointrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

- [ ] **Step 2: Create `frontend/src/contexts/AuthContext.jsx`**

```jsx
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cointrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cointrack_token');
    if (token && !user) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('cointrack_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('cointrack_token');
          localStorage.removeItem('cointrack_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('cointrack_token', res.data.token);
    localStorage.setItem('cointrack_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }

  async function register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('cointrack_token', res.data.token);
    localStorage.setItem('cointrack_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }

  function logout() {
    localStorage.removeItem('cointrack_token');
    localStorage.removeItem('cointrack_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 3: Create `frontend/src/hooks/useAuth.js`**

```jsx
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

- [ ] **Step 4: Create `frontend/src/components/PrivateRoute.jsx`**

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
```

- [ ] **Step 5: Update `frontend/src/App.jsx`** to use AuthProvider

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<p>Login Page</p>} />
        <Route path="/register" element={<p>Register Page</p>} />
        <Route path="/" element={<PrivateRoute><p>Dashboard</p></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 6: Commit**

```bash
cd "/home/tobot/Trabalho Final"
git add frontend/src/services/ frontend/src/contexts/ frontend/src/hooks/ frontend/src/components/PrivateRoute.jsx frontend/src/App.jsx
git commit -m "feat: add API service, AuthContext, and PrivateRoute"
```

---

### Task 4: Shared UI components — LoadingSpinner, Alert, Modal, ConfirmDialog, SummaryCard

**Files:**
- Create: `frontend/src/components/LoadingSpinner/LoadingSpinner.jsx`
- Create: `frontend/src/components/LoadingSpinner/LoadingSpinner.module.css`
- Create: `frontend/src/components/Alert/Alert.jsx`
- Create: `frontend/src/components/Alert/Alert.module.css`
- Create: `frontend/src/components/Modal/Modal.jsx`
- Create: `frontend/src/components/Modal/Modal.module.css`
- Create: `frontend/src/components/ConfirmDialog/ConfirmDialog.jsx`
- Create: `frontend/src/components/ConfirmDialog/ConfirmDialog.module.css`
- Create: `frontend/src/components/SummaryCard/SummaryCard.jsx`
- Create: `frontend/src/components/SummaryCard/SummaryCard.module.css`

- [ ] **Step 1: Create LoadingSpinner**

`LoadingSpinner.jsx`:
```jsx
import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
    </div>
  );
}
```

`LoadingSpinner.module.css`:
```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 2: Create Alert**

`Alert.jsx`:
```jsx
import { useEffect } from 'react';
import styles from './Alert.module.css';

export default function Alert({ type, message, onClose }) {
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button className={styles.close} onClick={onClose}>&times;</button>
      )}
    </div>
  );
}
```

`Alert.module.css`:
```css
.alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: 14px;
  margin-bottom: var(--spacing-md);
}

.success {
  background-color: var(--color-income-bg);
  color: var(--color-income);
  border: 1px solid var(--color-income);
}

.error {
  background-color: var(--color-expense-bg);
  color: var(--color-expense);
  border: 1px solid var(--color-expense);
}

.close {
  background: none;
  border: none;
  font-size: 18px;
  color: inherit;
  padding: 0 0 0 var(--spacing-sm);
}
```

- [ ] **Step 3: Create Modal**

`Modal.jsx`:
```jsx
import { useEffect } from 'react';
import styles from './Modal.module.css';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.close} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
```

`Modal.module.css`:
```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.title {
  font-size: 18px;
  font-weight: var(--font-weight-semibold);
}

.close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-text-secondary);
}

.body {
  padding: var(--spacing-lg);
}
```

- [ ] **Step 4: Create ConfirmDialog**

`ConfirmDialog.jsx`:
```jsx
import Modal from '../Modal/Modal';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Confirmar">
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onCancel}>Cancelar</button>
        <button className={styles.confirmBtn} onClick={onConfirm}>Confirmar</button>
      </div>
    </Modal>
  );
}
```

`ConfirmDialog.module.css`:
```css
.message {
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.cancelBtn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-secondary);
}

.confirmBtn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-expense);
  color: white;
}

.confirmBtn:hover {
  opacity: 0.9;
}
```

- [ ] **Step 5: Create SummaryCard**

`SummaryCard.jsx`:
```jsx
import styles from './SummaryCard.module.css';

export default function SummaryCard({ title, value, color, icon }) {
  const formattedValue = Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className={styles.card}>
      <div className={styles.icon} style={{ backgroundColor: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.value} style={{ color }}>{formattedValue}</p>
      </div>
    </div>
  );
}
```

`SummaryCard.module.css`:
```css
.card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--color-surface);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.title {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.value {
  font-size: 22px;
  font-weight: var(--font-weight-semibold);
}
```

- [ ] **Step 6: Commit**

```bash
cd "/home/tobot/Trabalho Final"
git add frontend/src/components/
git commit -m "feat: add shared UI components (LoadingSpinner, Alert, Modal, ConfirmDialog, SummaryCard)"
```

---

### Task 5: Layout and Sidebar components

**Files:**
- Create: `frontend/src/components/Sidebar/Sidebar.jsx`
- Create: `frontend/src/components/Sidebar/Sidebar.module.css`
- Create: `frontend/src/components/Layout/Layout.jsx`
- Create: `frontend/src/components/Layout/Layout.module.css`

- [ ] **Step 1: Create Sidebar**

`Sidebar.jsx`:
```jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/transactions', label: 'Transações', icon: '💰' },
  { to: '/categories', label: 'Categorias', icon: '📁' },
  { to: '/reports', label: 'Relatórios', icon: '📈' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <h1>CoinTrack</h1>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userName}>{user?.name}</div>
          <button className={styles.logoutBtn} onClick={logout}>
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
```

`Sidebar.module.css`:
```css
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  z-index: 50;
}

.overlay {
  display: none;
}

.logo {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.logo h1 {
  font-size: 22px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.nav {
  flex: 1;
  padding: var(--spacing-md) 0;
}

.navItem {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 15px;
  transition: background-color 0.15s, color 0.15s;
}

.navItem:hover {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.active {
  color: var(--color-primary);
  background-color: #eff6ff;
  border-right: 3px solid var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.navIcon {
  font-size: 18px;
}

.userSection {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.userName {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

.logoutBtn {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 14px;
}

.logoutBtn:hover {
  background: var(--color-bg);
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s;
  }

  .open {
    transform: translateX(0);
  }

  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 40;
  }
}
```

- [ ] **Step 2: Create Layout**

`Layout.jsx`:
```jsx
import { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={styles.main}>
        <button
          className={styles.menuBtn}
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
        {children}
      </main>
    </div>
  );
}
```

`Layout.module.css`:
```css
.layout {
  display: flex;
  min-height: 100vh;
}

.main {
  flex: 1;
  margin-left: var(--sidebar-width);
  padding: var(--spacing-lg);
}

.menuBtn {
  display: none;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 20px;
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

@media (max-width: 768px) {
  .main {
    margin-left: 0;
  }

  .menuBtn {
    display: block;
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd "/home/tobot/Trabalho Final"
git add frontend/src/components/Sidebar/ frontend/src/components/Layout/
git commit -m "feat: add Layout and Sidebar components with responsive menu"
```

---

### Task 6: Login and Register pages

**Files:**
- Create: `frontend/src/pages/Login/LoginPage.jsx`
- Create: `frontend/src/pages/Login/LoginPage.module.css`
- Create: `frontend/src/pages/Register/RegisterPage.jsx`
- Create: `frontend/src/pages/Register/RegisterPage.module.css`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Create LoginPage**

`LoginPage.jsx`:
```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Alert from '../../components/Alert/Alert';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.logo}>CoinTrack</h1>
        <p className={styles.subtitle}>Controle financeiro pessoal</p>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
            />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className={styles.link}>
          Não tem conta? <Link to="/register">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
```

`LoginPage.module.css`:
```css
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.card {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 400px;
}

.logo {
  text-align: center;
  color: var(--color-primary);
  font-size: 28px;
  margin-bottom: 4px;
}

.subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: var(--spacing-lg);
}

.field {
  margin-bottom: var(--spacing-md);
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}

.field input:focus {
  border-color: var(--color-primary);
}

.submitBtn {
  width: 100%;
  padding: 12px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  margin-top: var(--spacing-xs);
}

.submitBtn:hover {
  background: var(--color-primary-hover);
}

.submitBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link {
  text-align: center;
  margin-top: var(--spacing-md);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
}
```

- [ ] **Step 2: Create RegisterPage**

`RegisterPage.jsx`:
```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Alert from '../../components/Alert/Alert';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.logo}>CoinTrack</h1>
        <p className={styles.subtitle}>Crie sua conta</p>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
            />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Cadastrar'}
          </button>
        </form>

        <p className={styles.link}>
          Já tem conta? <Link to="/login">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
```

`RegisterPage.module.css` — same as `LoginPage.module.css` (copy the exact same file content).

- [ ] **Step 3: Update `frontend/src/App.jsx`** with real page imports

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute><Layout><p>Dashboard</p></Layout></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Layout><p>Transações</p></Layout></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><Layout><p>Categorias</p></Layout></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Layout><p>Relatórios</p></Layout></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 4: Start backend + frontend and verify login/register flow works in browser**

```bash
cd "/home/tobot/Trabalho Final/backend" && node src/server.js &
cd "/home/tobot/Trabalho Final/frontend" && npm run dev -- --host &
```

Open `http://localhost:5173/login` in browser. Verify:
- Login form renders
- Register link navigates to `/register`
- Register form validates (empty fields, short password, mismatch)
- Successful register redirects to `/` (dashboard placeholder)
- Logout returns to `/login`
- Login with created credentials works

- [ ] **Step 5: Commit**

```bash
cd "/home/tobot/Trabalho Final"
git add frontend/src/pages/Login/ frontend/src/pages/Register/ frontend/src/App.jsx
git commit -m "feat: add Login and Register pages with auth flow"
```

---

### Task 7: Dashboard page

**Files:**
- Create: `frontend/src/pages/Dashboard/DashboardPage.jsx`
- Create: `frontend/src/pages/Dashboard/DashboardPage.module.css`
- Modify: `frontend/src/App.jsx` (replace placeholder)

- [ ] **Step 1: Create DashboardPage**

`DashboardPage.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../../services/api';
import SummaryCard from '../../components/SummaryCard/SummaryCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './DashboardPage.module.css';

const CHART_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

function getMonthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { startDate, endDate } = getMonthRange(monthOffset);
      try {
        const [summaryRes, categoryRes, transactionsRes] = await Promise.all([
          api.get('/reports/summary', { params: { startDate, endDate } }),
          api.get('/reports/by-category', { params: { startDate, endDate } }),
          api.get('/transactions', { params: { limit: 5 } }),
        ]);
        setSummary(summaryRes.data);
        setCategoryData(
          (categoryRes.data.categories || []).map((c) => ({
            name: c.name || c.category,
            value: Number(c.total || c.amount),
          }))
        );
        setRecentTransactions(transactionsRes.data.transactions || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [monthOffset]);

  if (loading) return <LoadingSpinner />;

  const { startDate } = getMonthRange(monthOffset);
  const monthLabel = new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.monthSelector}>
          <button onClick={() => setMonthOffset((p) => p - 1)}>&larr;</button>
          <span className={styles.monthLabel}>{monthLabel}</span>
          <button onClick={() => setMonthOffset((p) => p + 1)}>&rarr;</button>
        </div>
      </div>

      <div className={styles.cards}>
        <SummaryCard title="Receitas" value={summary?.totalIncome || 0} color="var(--color-income)" icon="↑" />
        <SummaryCard title="Despesas" value={summary?.totalExpense || 0} color="var(--color-expense)" icon="↓" />
        <SummaryCard
          title="Saldo"
          value={summary?.balance || 0}
          color={(summary?.balance || 0) >= 0 ? 'var(--color-primary)' : 'var(--color-expense)'}
          icon="$"
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.chartSection}>
          <h2>Gastos por Categoria</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.empty}>Nenhum gasto neste período</p>
          )}
        </div>

        <div className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h2>Últimas Transações</h2>
            <Link to="/transactions" className={styles.viewAll}>Ver todas</Link>
          </div>
          {recentTransactions.length > 0 ? (
            <ul className={styles.transactionList}>
              {recentTransactions.map((t) => (
                <li key={t.id} className={styles.transactionItem}>
                  <div>
                    <span className={styles.transactionDesc}>{t.description || 'Sem descrição'}</span>
                    <span className={styles.transactionDate}>
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <span className={t.type === 'income' ? styles.incomeValue : styles.expenseValue}>
                    {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>Nenhuma transação ainda</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

`DashboardPage.module.css`:
```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.header h1 {
  font-size: 24px;
}

.monthSelector {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.monthSelector button {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: 16px;
  color: var(--color-text);
}

.monthLabel {
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  text-transform: capitalize;
  min-width: 140px;
  text-align: center;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.chartSection,
.recentSection {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
}

.chartSection h2,
.recentSection h2 {
  font-size: 16px;
  margin-bottom: var(--spacing-md);
}

.recentHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.viewAll {
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
}

.transactionList {
  list-style: none;
}

.transactionItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.transactionItem:last-child {
  border-bottom: none;
}

.transactionDesc {
  font-size: 14px;
  display: block;
}

.transactionDate {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.incomeValue {
  color: var(--color-income);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

.expenseValue {
  color: var(--color-expense);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

.empty {
  color: var(--color-text-secondary);
  font-size: 14px;
  text-align: center;
  padding: var(--spacing-xl);
}
```

- [ ] **Step 2: Update `frontend/src/App.jsx`** — replace dashboard placeholder

Import `DashboardPage` and use it:

```jsx
import DashboardPage from './pages/Dashboard/DashboardPage';
// ... existing imports ...

// Replace the "/" route:
<Route path="/" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
```

- [ ] **Step 3: Verify in browser** — login, check dashboard loads with cards and chart

- [ ] **Step 4: Commit**

```bash
cd "/home/tobot/Trabalho Final"
git add frontend/src/pages/Dashboard/ frontend/src/App.jsx
git commit -m "feat: add Dashboard page with summary cards and category chart"
```

---

### Task 8: Transactions page with CRUD

**Files:**
- Create: `frontend/src/pages/Transactions/TransactionsPage.jsx`
- Create: `frontend/src/pages/Transactions/TransactionsPage.module.css`
- Create: `frontend/src/pages/Transactions/TransactionModal.jsx`
- Create: `frontend/src/pages/Transactions/TransactionModal.module.css`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Create TransactionModal**

`TransactionModal.jsx`:
```jsx
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import api from '../../services/api';
import styles from './TransactionModal.module.css';

export default function TransactionModal({ isOpen, onClose, onSaved, transaction }) {
  const [form, setForm] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    categoryId: '',
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/categories').then((res) => setCategories(res.data.categories || []));
      if (transaction) {
        setForm({
          amount: String(transaction.amount),
          description: transaction.description || '',
          date: transaction.date.split('T')[0],
          type: transaction.type,
          categoryId: transaction.categoryId ? String(transaction.categoryId) : '',
        });
      } else {
        setForm({ amount: '', description: '', date: new Date().toISOString().split('T')[0], type: 'expense', categoryId: '' });
      }
      setError('');
    }
  }, [isOpen, transaction]);

  const filteredCategories = categories.filter((c) => c.type === form.type);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.amount || !form.date) {
      setError('Valor e data são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(form.amount),
        description: form.description || null,
        date: form.date,
        type: form.type,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      };

      if (transaction) {
        await api.put(`/transactions/${transaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Editar Transação' : 'Nova Transação'}>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.typeToggle}>
          <button
            type="button"
            className={`${styles.typeBtn} ${form.type === 'expense' ? styles.expenseActive : ''}`}
            onClick={() => setForm((f) => ({ ...f, type: 'expense', categoryId: '' }))}
          >
            Despesa
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${form.type === 'income' ? styles.incomeActive : ''}`}
            onClick={() => setForm((f) => ({ ...f, type: 'income', categoryId: '' }))}
          >
            Receita
          </button>
        </div>

        <div className={styles.field}>
          <label>Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />
        </div>

        <div className={styles.field}>
          <label>Descrição</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Opcional"
          />
        </div>

        <div className={styles.field}>
          <label>Data</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>

        <div className={styles.field}>
          <label>Categoria</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          >
            <option value="">Sem categoria</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button className={styles.submitBtn} type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </Modal>
  );
}
```

`TransactionModal.module.css`:
```css
.error {
  color: var(--color-expense);
  font-size: 13px;
  margin-bottom: var(--spacing-md);
}

.typeToggle {
  display: flex;
  gap: 0;
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.typeBtn {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
}

.expenseActive {
  background: var(--color-expense);
  color: white;
}

.incomeActive {
  background: var(--color-income);
  color: white;
}

.field {
  margin-bottom: var(--spacing-md);
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.field input,
.field select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
}

.field input:focus,
.field select:focus {
  border-color: var(--color-primary);
}

.submitBtn {
  width: 100%;
  padding: 12px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  margin-top: var(--spacing-xs);
}

.submitBtn:hover {
  background: var(--color-primary-hover);
}

.submitBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

- [ ] **Step 2: Create TransactionsPage**

`TransactionsPage.jsx`:
```jsx
import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import TransactionModal from './TransactionModal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './TransactionsPage.module.css';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ type: '', categoryId: '', startDate: '', endDate: '' });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filters.type) params.type = filters.type;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data.transactions || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      setAlert({ type: 'error', message: 'Erro ao carregar transações' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories || []));
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  function handleEdit(t) {
    setEditingTransaction(t);
    setModalOpen(true);
  }

  function handleNew() {
    setEditingTransaction(null);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/transactions/${deleteTarget.id}`);
      setAlert({ type: 'success', message: 'Transação excluída' });
      setDeleteTarget(null);
      fetchTransactions(pagination.page);
    } catch {
      setAlert({ type: 'error', message: 'Erro ao excluir transação' });
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>Transações</h1>
        <button className={styles.newBtn} onClick={handleNew}>+ Nova Transação</button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className={styles.filters}>
        <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
          <option value="">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
        <select value={filters.categoryId} onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
          placeholder="Data inicial"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
          placeholder="Data final"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : transactions.length === 0 ? (
        <p className={styles.empty}>Nenhuma transação encontrada</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td>{t.description || '-'}</td>
                    <td>{t.category?.name || '-'}</td>
                    <td>
                      <span className={t.type === 'income' ? styles.tagIncome : styles.tagExpense}>
                        {t.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className={t.type === 'income' ? styles.incomeValue : styles.expenseValue}>
                      R$ {Number(t.amount).toFixed(2)}
                    </td>
                    <td className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => handleEdit(t)}>Editar</button>
                      <button className={styles.deleteBtn} onClick={() => setDeleteTarget(t)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button disabled={pagination.page <= 1} onClick={() => fetchTransactions(pagination.page - 1)}>Anterior</button>
              <span>Página {pagination.page} de {pagination.pages}</span>
              <button disabled={pagination.page >= pagination.pages} onClick={() => fetchTransactions(pagination.page + 1)}>Próxima</button>
            </div>
          )}
        </>
      )}

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setAlert({ type: 'success', message: editingTransaction ? 'Transação atualizada' : 'Transação criada' });
          fetchTransactions(pagination.page);
        }}
        transaction={editingTransaction}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message="Tem certeza que deseja excluir esta transação?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
```

`TransactionsPage.module.css`:
```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.header h1 {
  font-size: 24px;
}

.newBtn {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
}

.newBtn:hover {
  background: var(--color-primary-hover);
}

.filters {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.filters select,
.filters input {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: var(--color-surface);
  outline: none;
}

.filters select:focus,
.filters input:focus {
  border-color: var(--color-primary);
}

.tableWrapper {
  overflow-x: auto;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  text-align: left;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  white-space: nowrap;
}

.table th {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  font-size: 13px;
}

.tagIncome {
  background: var(--color-income-bg);
  color: var(--color-income);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
}

.tagExpense {
  background: var(--color-expense-bg);
  color: var(--color-expense);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
}

.incomeValue {
  color: var(--color-income);
  font-weight: var(--font-weight-semibold);
}

.expenseValue {
  color: var(--color-expense);
  font-weight: var(--font-weight-semibold);
}

.actions {
  display: flex;
  gap: var(--spacing-xs);
}

.editBtn {
  padding: 4px 10px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-primary);
  font-size: 13px;
}

.deleteBtn {
  padding: 4px 10px;
  border: 1px solid var(--color-expense);
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-expense);
  font-size: 13px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.pagination button {
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 14px;
  color: var(--color-text);
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: var(--spacing-xl);
}
```

- [ ] **Step 3: Update `App.jsx`** — import TransactionsPage and replace placeholder

```jsx
import TransactionsPage from './pages/Transactions/TransactionsPage';
// ...
<Route path="/transactions" element={<PrivateRoute><Layout><TransactionsPage /></Layout></PrivateRoute>} />
```

- [ ] **Step 4: Verify in browser** — create, edit, delete transactions; check filters and pagination

- [ ] **Step 5: Commit**

```bash
cd "/home/tobot/Trabalho Final"
git add frontend/src/pages/Transactions/ frontend/src/App.jsx
git commit -m "feat: add Transactions page with CRUD, filters and pagination"
```

---

### Task 9: Categories page with CRUD

**Files:**
- Create: `frontend/src/pages/Categories/CategoriesPage.jsx`
- Create: `frontend/src/pages/Categories/CategoriesPage.module.css`
- Create: `frontend/src/pages/Categories/CategoryModal.jsx`
- Create: `frontend/src/pages/Categories/CategoryModal.module.css`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Create CategoryModal**

`CategoryModal.jsx`:
```jsx
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import api from '../../services/api';
import styles from './CategoryModal.module.css';

export default function CategoryModal({ isOpen, onClose, onSaved, category }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name);
        setType(category.type);
      } else {
        setName('');
        setType('expense');
      }
      setError('');
    }
  }, [isOpen, category]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    setLoading(true);
    try {
      if (category) {
        await api.put(`/categories/${category.id}`, { name: name.trim(), type });
      } else {
        await api.post('/categories', { name: name.trim(), type });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? 'Editar Categoria' : 'Nova Categoria'}>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label>Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da categoria"
          />
        </div>

        <div className={styles.field}>
          <label>Tipo</label>
          <div className={styles.typeToggle}>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'expense' ? styles.expenseActive : ''}`}
              onClick={() => setType('expense')}
            >
              Despesa
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'income' ? styles.incomeActive : ''}`}
              onClick={() => setType('income')}
            >
              Receita
            </button>
          </div>
        </div>

        <button className={styles.submitBtn} type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </Modal>
  );
}
```

`CategoryModal.module.css`:
```css
.error {
  color: var(--color-expense);
  font-size: 13px;
  margin-bottom: var(--spacing-md);
}

.field {
  margin-bottom: var(--spacing-md);
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
}

.field input:focus {
  border-color: var(--color-primary);
}

.typeToggle {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.typeBtn {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
}

.expenseActive {
  background: var(--color-expense);
  color: white;
}

.incomeActive {
  background: var(--color-income);
  color: white;
}

.submitBtn {
  width: 100%;
  padding: 12px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  margin-top: var(--spacing-xs);
}

.submitBtn:hover {
  background: var(--color-primary-hover);
}

.submitBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

- [ ] **Step 2: Create CategoriesPage**

`CategoriesPage.jsx`:
```jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import CategoryModal from './CategoryModal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './CategoriesPage.module.css';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [alert, setAlert] = useState(null);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch {
      setAlert({ type: 'error', message: 'Erro ao carregar categorias' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function handleEdit(c) {
    setEditingCategory(c);
    setModalOpen(true);
  }

  function handleNew() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/categories/${deleteTarget.id}`);
      setAlert({ type: 'success', message: 'Categoria excluída' });
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Erro ao excluir categoria' });
      setDeleteTarget(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className={styles.header}>
        <h1>Categorias</h1>
        <button className={styles.newBtn} onClick={handleNew}>+ Nova Categoria</button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {categories.length === 0 ? (
        <p className={styles.empty}>Nenhuma categoria cadastrada</p>
      ) : (
        <div className={styles.grid}>
          {categories.map((c) => (
            <div key={c.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardName}>{c.name}</h3>
                <span className={c.type === 'income' ? styles.tagIncome : styles.tagExpense}>
                  {c.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.editBtn} onClick={() => handleEdit(c)}>Editar</button>
                <button className={styles.deleteBtn} onClick={() => setDeleteTarget(c)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setAlert({ type: 'success', message: editingCategory ? 'Categoria atualizada' : 'Categoria criada' });
          fetchCategories();
        }}
        category={editingCategory}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`Excluir a categoria "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
```

`CategoriesPage.module.css`:
```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.header h1 {
  font-size: 24px;
}

.newBtn {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
}

.newBtn:hover {
  background: var(--color-primary-hover);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.cardName {
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
}

.tagIncome {
  background: var(--color-income-bg);
  color: var(--color-income);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
}

.tagExpense {
  background: var(--color-expense-bg);
  color: var(--color-expense);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
}

.cardActions {
  display: flex;
  gap: var(--spacing-xs);
}

.editBtn {
  padding: 4px 10px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-primary);
  font-size: 13px;
}

.deleteBtn {
  padding: 4px 10px;
  border: 1px solid var(--color-expense);
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-expense);
  font-size: 13px;
}

.empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: var(--spacing-xl);
}
```

- [ ] **Step 3: Update `App.jsx`** — import CategoriesPage and replace placeholder

```jsx
import CategoriesPage from './pages/Categories/CategoriesPage';
// ...
<Route path="/categories" element={<PrivateRoute><Layout><CategoriesPage /></Layout></PrivateRoute>} />
```

- [ ] **Step 4: Verify in browser** — create, edit, delete categories

- [ ] **Step 5: Commit**

```bash
cd "/home/tobot/Trabalho Final"
git add frontend/src/pages/Categories/ frontend/src/App.jsx
git commit -m "feat: add Categories page with CRUD"
```

---

### Task 10: Reports page with charts

**Files:**
- Create: `frontend/src/pages/Reports/ReportsPage.jsx`
- Create: `frontend/src/pages/Reports/ReportsPage.module.css`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Create ReportsPage**

`ReportsPage.jsx`:
```jsx
import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ReportsPage.module.css';

const CHART_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

function getDefaultRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
  };
}

export default function ReportsPage() {
  const [range, setRange] = useState(getDefaultRange);
  const [categoryData, setCategoryData] = useState([]);
  const [periodData, setPeriodData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const [catRes, periodRes] = await Promise.all([
          api.get('/reports/by-category', { params: range }),
          api.get('/reports/by-period', { params: { ...range, groupBy: 'month' } }),
        ]);

        setCategoryData(
          (catRes.data.categories || []).map((c) => ({
            name: c.name || c.category,
            value: Number(c.total || c.amount),
          }))
        );

        const months = periodRes.data.periods || periodRes.data.months || [];
        setPeriodData(
          months.map((m) => ({
            name: m.period || m.month,
            receitas: Number(m.income || m.totalIncome || 0),
            despesas: Number(m.expense || m.totalExpense || 0),
            saldo: Number((m.income || m.totalIncome || 0) - (m.expense || m.totalExpense || 0)),
          }))
        );
      } catch (err) {
        console.error('Reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [range]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className={styles.header}>
        <h1>Relatórios</h1>
        <div className={styles.dateRange}>
          <input
            type="date"
            value={range.startDate}
            onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))}
          />
          <span>até</span>
          <input
            type="date"
            value={range.endDate}
            onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))}
          />
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.chartCard}>
          <h2>Gastos por Categoria</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.empty}>Nenhum dado disponível</p>
          )}
        </div>

        <div className={styles.chartCard}>
          <h2>Receitas vs Despesas por Mês</h2>
          {periodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={periodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="receitas" fill="var(--color-income)" name="Receitas" />
                <Bar dataKey="despesas" fill="var(--color-expense)" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.empty}>Nenhum dado disponível</p>
          )}
        </div>

        <div className={styles.chartCard + ' ' + styles.fullWidth}>
          <h2>Evolução do Saldo</h2>
          {periodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={periodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="saldo" stroke="var(--color-primary)" name="Saldo" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.empty}>Nenhum dado disponível</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

`ReportsPage.module.css`:
```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.header h1 {
  font-size: 24px;
}

.dateRange {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.dateRange input {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
}

.dateRange input:focus {
  border-color: var(--color-primary);
}

.dateRange span {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.chartCard {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
}

.chartCard h2 {
  font-size: 16px;
  margin-bottom: var(--spacing-md);
}

.fullWidth {
  grid-column: 1 / -1;
}

.empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: var(--spacing-xl);
}
```

- [ ] **Step 2: Update `App.jsx`** — import ReportsPage and replace placeholder

```jsx
import ReportsPage from './pages/Reports/ReportsPage';
// ...
<Route path="/reports" element={<PrivateRoute><Layout><ReportsPage /></Layout></PrivateRoute>} />
```

- [ ] **Step 3: Verify in browser** — date range picker works, charts render with data

- [ ] **Step 4: Commit**

```bash
cd "/home/tobot/Trabalho Final"
git add frontend/src/pages/Reports/ frontend/src/App.jsx
git commit -m "feat: add Reports page with pie, bar and line charts"
```

---

### Task 11: Final App.jsx assembly and end-to-end verification

**Files:**
- Modify: `frontend/src/App.jsx` (final version with all imports)

- [ ] **Step 1: Write final `frontend/src/App.jsx`**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import CategoriesPage from './pages/Categories/CategoriesPage';
import ReportsPage from './pages/Reports/ReportsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Layout><TransactionsPage /></Layout></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><Layout><CategoriesPage /></Layout></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Layout><ReportsPage /></Layout></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 2: Start backend and frontend, run full end-to-end test**

```bash
cd "/home/tobot/Trabalho Final/backend" && node src/server.js &
cd "/home/tobot/Trabalho Final/frontend" && npm run dev -- --host &
```

Open `http://localhost:5173` in browser and verify:
1. `/login` renders — try invalid credentials, verify error message
2. `/register` — create a new user, verify redirect to dashboard
3. Dashboard — 3 summary cards, category chart, recent transactions
4. `/categories` — create "Alimentação" (expense), "Salário" (income)
5. `/transactions` — create expense with category, create income, verify table
6. `/transactions` — edit a transaction, delete one, verify filters work
7. Dashboard — verify summary updates with new data
8. `/reports` — verify pie chart, bar chart, line chart render with data
9. Sidebar — verify all nav links highlight correctly, logout works
10. Responsive — resize to mobile width, verify hamburger menu works

- [ ] **Step 3: Final commit**

```bash
cd "/home/tobot/Trabalho Final"
git add -A
git commit -m "feat: complete CoinTrack frontend with all pages and components"
```
