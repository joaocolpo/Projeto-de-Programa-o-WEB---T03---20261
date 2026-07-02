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
