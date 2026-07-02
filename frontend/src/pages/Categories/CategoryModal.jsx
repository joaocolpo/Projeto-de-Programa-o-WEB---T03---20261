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
