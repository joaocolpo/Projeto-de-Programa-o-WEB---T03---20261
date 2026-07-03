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
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
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
