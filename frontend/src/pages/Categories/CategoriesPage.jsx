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
