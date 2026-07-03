import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../../services/api';
import SummaryCard from '../../components/SummaryCard/SummaryCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './DashboardPage.module.css';

<<<<<<< HEAD
const CHART_COLORS = ['#10B981', '#4ADE80', '#F87171', '#FBBF24', '#2DD4BF', '#34D399', '#FB923C', '#A78BFA'];
=======
const CHART_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
>>>>>>> 18b6c1050fb311df61f628fac5bf42b35b7668d4

function getMonthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

<<<<<<< HEAD
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{payload[0].name}</p>
      <p className={styles.tooltipValue}>R$ {Number(payload[0].value).toFixed(2)}</p>
    </div>
  );
};

=======
>>>>>>> 18b6c1050fb311df61f628fac5bf42b35b7668d4
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
<<<<<<< HEAD
        const transactionsRes = await api.get('/transactions', { params: { limit: 5 } });
        setSummary(null);
        setCategoryData([]);
=======
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
>>>>>>> 18b6c1050fb311df61f628fac5bf42b35b7668d4
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
<<<<<<< HEAD
        <div>
          <h1>Dashboard</h1>
          <p className={styles.headerSub}>Visão geral das suas finanças</p>
        </div>
        <div className={styles.monthSelector}>
          <button onClick={() => setMonthOffset((p) => p - 1)} aria-label="Mês anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span className={styles.monthLabel}>{monthLabel}</span>
          <button onClick={() => setMonthOffset((p) => p + 1)} aria-label="Próximo mês">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
=======
        <h1>Dashboard</h1>
        <div className={styles.monthSelector}>
          <button onClick={() => setMonthOffset((p) => p - 1)}>&larr;</button>
          <span className={styles.monthLabel}>{monthLabel}</span>
          <button onClick={() => setMonthOffset((p) => p + 1)}>&rarr;</button>
>>>>>>> 18b6c1050fb311df61f628fac5bf42b35b7668d4
        </div>
      </div>

      <div className={styles.cards}>
<<<<<<< HEAD
        <SummaryCard title="Receitas" value={summary?.totalIncome || 0} color="var(--color-income)" iconType="income" />
        <SummaryCard title="Despesas" value={summary?.totalExpense || 0} color="var(--color-expense)" iconType="expense" />
=======
        <SummaryCard title="Receitas" value={summary?.totalIncome || 0} color="var(--color-income)" icon="↑" />
        <SummaryCard title="Despesas" value={summary?.totalExpense || 0} color="var(--color-expense)" icon="↓" />
>>>>>>> 18b6c1050fb311df61f628fac5bf42b35b7668d4
        <SummaryCard
          title="Saldo"
          value={summary?.balance || 0}
          color={(summary?.balance || 0) >= 0 ? 'var(--color-primary)' : 'var(--color-expense)'}
<<<<<<< HEAD
          iconType="balance"
=======
          icon="$"
>>>>>>> 18b6c1050fb311df61f628fac5bf42b35b7668d4
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.chartSection}>
          <h2>Gastos por Categoria</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
<<<<<<< HEAD
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
=======
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
>>>>>>> 18b6c1050fb311df61f628fac5bf42b35b7668d4
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
<<<<<<< HEAD
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#6B9080', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.empty}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
              <p>Nenhum gasto neste período</p>
            </div>
=======
                <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.empty}>Nenhum gasto neste período</p>
>>>>>>> 18b6c1050fb311df61f628fac5bf42b35b7668d4
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
<<<<<<< HEAD
                  <div className={styles.transactionLeft}>
                    <div className={`${styles.transactionDot} ${t.type === 'income' ? styles.dotIncome : styles.dotExpense}`} />
                    <div>
                      <span className={styles.transactionDesc}>{t.description || 'Sem descrição'}</span>
                      <span className={styles.transactionDate}>
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
=======
                  <div>
                    <span className={styles.transactionDesc}>{t.description || 'Sem descrição'}</span>
                    <span className={styles.transactionDate}>
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </span>
>>>>>>> 18b6c1050fb311df61f628fac5bf42b35b7668d4
                  </div>
                  <span className={t.type === 'income' ? styles.incomeValue : styles.expenseValue}>
                    {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
<<<<<<< HEAD
            <div className={styles.empty}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <p>Nenhuma transação ainda</p>
            </div>
=======
            <p className={styles.empty}>Nenhuma transação ainda</p>
>>>>>>> 18b6c1050fb311df61f628fac5bf42b35b7668d4
          )}
        </div>
      </div>
    </div>
  );
}
