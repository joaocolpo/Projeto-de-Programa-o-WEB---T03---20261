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
                <Bar dataKey="receitas" fill="#16a34a" name="Receitas" />
                <Bar dataKey="despesas" fill="#dc2626" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.empty}>Nenhum dado disponível</p>
          )}
        </div>

        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
          <h2>Evolução do Saldo</h2>
          {periodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={periodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="saldo" stroke="#2563eb" name="Saldo" strokeWidth={2} />
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
