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
