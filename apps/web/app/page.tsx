'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const [taskInput, setTaskInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskInput.trim()) {
      // TODO: Add task to state
      setTaskInput('');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>ProcrastinAct</h1>
        <p className={styles.tagline}>Start tasks, not guilt.</p>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.timerCircle}>
            <span className={styles.timerText}>25:00</span>
            <span className={styles.timerLabel}>Focus Time</span>
          </div>
          <button className={styles.startButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start
          </button>
        </section>

        <section className={styles.taskSection}>
          <h2 className={styles.sectionTitle}>What&apos;s one tiny thing?</h2>
          <form onSubmit={handleSubmit} className={styles.taskForm}>
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Add a small task..."
              className={styles.taskInput}
            />
            <button type="submit" className={styles.addButton}>
              Add
            </button>
          </form>
        </section>

        <section className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <p className={styles.emptyText}>No tasks yet</p>
          <p className={styles.emptyHint}>
            Start small. What&apos;s one tiny thing you could do right now?
          </p>
        </section>

        <section className={styles.encouragement}>
          <p>
            &quot;Just starting is the hardest part. You&apos;ve got this.&quot;
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navItem} ${styles.active}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
            <span>Tasks</span>
          </Link>
          <Link href="/timer" className={styles.navItem}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
            <span>Timer</span>
          </Link>
          <Link href="/profile" className={styles.navItem}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span>Profile</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
}
