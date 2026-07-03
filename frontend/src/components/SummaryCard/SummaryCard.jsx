import styles from './SummaryCard.module.css';

<<<<<<< HEAD
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
=======
export default function SummaryCard({ title, value, color, icon }) {
>>>>>>> 18b6c1050fb311df61f628fac5bf42b35b7668d4
  const formattedValue = Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className={styles.card}>
<<<<<<< HEAD
      <div className={styles.cardTop}>
        <p className={styles.title}>{title}</p>
        <div className={styles.icon} style={{ color }}>
          {icons[iconType] || icons.balance}
        </div>
      </div>
      <p className={styles.value}>{formattedValue}</p>
      <div className={styles.accent} style={{ background: color }} />
=======
      <div className={styles.icon} style={{ backgroundColor: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.value} style={{ color }}>{formattedValue}</p>
      </div>
>>>>>>> 18b6c1050fb311df61f628fac5bf42b35b7668d4
    </div>
  );
}
