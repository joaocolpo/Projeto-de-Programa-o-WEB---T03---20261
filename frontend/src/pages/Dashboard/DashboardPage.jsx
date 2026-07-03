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
