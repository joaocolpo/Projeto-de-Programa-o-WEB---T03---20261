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
