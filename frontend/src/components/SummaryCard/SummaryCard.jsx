import styles from './SummaryCard.module.css';

export default function SummaryCard({ title, value, color, icon }) {
  const formattedValue = Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className={styles.card}>
      <div className={styles.icon} style={{ backgroundColor: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.value} style={{ color }}>{formattedValue}</p>
      </div>
    </div>
  );
}
