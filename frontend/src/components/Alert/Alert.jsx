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
