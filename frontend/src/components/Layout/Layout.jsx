import { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={styles.main}>
        <button
          className={styles.menuBtn}
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
        {children}
      </main>
    </div>
  );
}
