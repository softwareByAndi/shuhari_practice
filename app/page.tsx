'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import RecentPractice from '@/components/RecentPractice';
import { getActiveFields } from '@/lib/supabase-v2';
import { Field } from '@/lib/types/database';
import styles from './page.module.css';

// Field icon and color mapping
const FIELD_STYLES: Record<string, { icon: string; color: string }> = {
  'math': { icon: '🔢', color: 'bg-blue-500' },
  'chemistry': { icon: '⚗️', color: 'bg-green-500' },
  'biology': { icon: '🧬', color: 'bg-emerald-500' },
  'programming': { icon: '💻', color: 'bg-purple-500' },
  'physics': { icon: '⚛️', color: 'bg-indigo-500' },
  'history': { icon: '📜', color: 'bg-amber-500' },
  'engineering': { icon: '⚙️', color: 'bg-gray-500' },
  'language': { icon: '📝', color: 'bg-pink-500' },
  'philosophy': { icon: '🤔', color: 'bg-violet-500' },
  'law': { icon: '⚖️', color: 'bg-red-500' },
  'psychology': { icon: '🧠', color: 'bg-orange-500' },
  'economics': { icon: '📈', color: 'bg-teal-500' },
};

export default function Home() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFields() {
      const activeFields = await getActiveFields();
      setFields(activeFields);
      setLoading(false);
    }
    loadFields();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>
            ShuHaRi Learning
          </h1>
          <p className={styles.pageSubtitle}>
            Master any subject through the ancient martial arts principle of learning
          </p>
        </div>

        {/* 7-Stage Journey Explanation */}
        <div className={styles.shuHaRiSection}>
          <h2 className={styles.sectionTitle}>Your 7-Stage Journey to Mastery</h2>
          <div className={styles.stageCards}>
            <div className={styles.stageRow}>
              <div className={styles.shuHaRiCard}>
                <div className={`${styles.shuHaRiSymbol} hatsu`}>初</div>
                <h3 className={`${styles.shuHaRiTitle} hatsu`}>Hatsu - Begin</h3>
                <p className={styles.shuHaRiDescription}>
                  First exposure. Building familiarity with basic concepts.
                </p>
              </div>
              <div className={styles.shuHaRiCard}>
                <div className={`${styles.shuHaRiSymbol} shu`}>守</div>
                <h3 className={`${styles.shuHaRiTitle} shu`}>Shu - Obey</h3>
                <p className={styles.shuHaRiDescription}>
                  Following patterns. Building automaticity through repetition.
                </p>
              </div>
              <div className={styles.shuHaRiCard}>
                <div className={`${styles.shuHaRiSymbol} kan`}>鑑</div>
                <h3 className={`${styles.shuHaRiTitle} kan`}>Kan - Mirror</h3>
                <p className={styles.shuHaRiDescription}>
                  Reflecting patterns. Recognizing structures and relationships.
                </p>
              </div>
            </div>
            <div className={styles.stageRow}>
              <div className={styles.shuHaRiCard}>
                <div className={`${styles.shuHaRiSymbol} ha`}>破</div>
                <h3 className={`${styles.shuHaRiTitle} ha`}>Ha - Break</h3>
                <p className={styles.shuHaRiDescription}>
                  Questioning patterns. Exploring variations and edge cases.
                </p>
              </div>
              <div className={styles.shuHaRiCard}>
                <div className={`${styles.shuHaRiSymbol} toi`}>問</div>
                <h3 className={`${styles.shuHaRiTitle} toi`}>Toi - Question</h3>
                <p className={styles.shuHaRiDescription}>
                  Deep inquiry. Understanding the why behind the how.
                </p>
              </div>
              <div className={styles.shuHaRiCard}>
                <div className={`${styles.shuHaRiSymbol} ri`}>離</div>
                <h3 className={`${styles.shuHaRiTitle} ri`}>Ri - Leave</h3>
                <p className={styles.shuHaRiDescription}>
                  Transcending rules. Creating innovative solutions.
                </p>
              </div>
              <div className={styles.shuHaRiCard}>
                <div className={`${styles.shuHaRiSymbol} ku`}>空</div>
                <h3 className={`${styles.shuHaRiTitle} ku`}>Ku - Void</h3>
                <p className={styles.shuHaRiDescription}>
                  Effortless mastery. Teaching and inspiring others.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fields Grid */}
        <div className={styles.subjectsSection}>
          <h2 className={styles.sectionTitle}>Choose Your Field</h2>
          {loading ? (
            <div className={styles.loading}>Loading fields...</div>
          ) : (
            <div className={styles.subjectsGrid}>
              {fields.map((field) => {
                const fieldStyle = FIELD_STYLES[field.code] || { icon: '📚', color: 'bg-gray-500' };
                return field.is_active ? (
                  <a
                    key={field.field_id}
                    href={`/practice/${field.code}`}
                    className={styles.subjectCard}
                  >
                    <div className={`${styles.subjectGlow} ${fieldStyle.color}`}></div>
                    <div className={styles.subjectContent}>
                      <div className={styles.subjectIcon}>{fieldStyle.icon}</div>
                      <h3 className={styles.subjectName}>
                        {field.display_name}
                      </h3>
                      <p className={styles.subjectAction}>
                        Start your journey →
                      </p>
                    </div>
                  </a>
                ) : (
                  <div
                    key={field.field_id}
                    className={styles.subjectCardDisabled}
                  >
                    <div className={styles.subjectContent}>
                      <div className={styles.subjectIconDisabled}>{fieldStyle.icon}</div>
                      <h3 className={styles.subjectNameDisabled}>
                        {field.display_name}
                      </h3>
                      <p className={styles.subjectActionDisabled}>
                        Coming soon...
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Recent Practice</h2>
          <RecentPractice />
        </div>
      </main>
    </div>
  );
}
