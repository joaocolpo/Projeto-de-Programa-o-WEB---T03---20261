import styles from './SummaryCard.module.css';

const icons = {
  income: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  expense: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  ),
  balance: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M15 9.5H10.5a2.5 2.5 0 0 0 0 5H14a2.5 2.5 0 0 1 0 5H9" />
    </svg>
  ),
};

export default function SummaryCard({ title, value, color, iconType }) {
  const formattedValue = Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <p className={styles.title}>{title}</p>
        <div className={styles.icon} style={{ color }}>
          {icons[iconType] || icons.balance}
        </div>
      </div>
      <p className={styles.value}>{formattedValue}</p>
      <div className={styles.accent} style={{ background: color }} />
    </div>
  );
}
