'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSubjectsForField } from '@/lib/supabase-v2';
import { Subject } from '@/lib/types/database';
import styles from './page.module.css';

// Subject icons mapping
const SUBJECT_ICONS: Record<string, string> = {
  'arithmetic': '➕',
  'algebra': '𝒙',
  'geometry': '📐',
  'calculus': '∫',
  'statistics': '📊',
};

export default function MathPractice() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      // Math field has field_id = 101
      const mathFieldId = 101;
      const subjectList = await getSubjectsForField(mathFieldId);
      setSubjects(subjectList);
      setLoading(false);
    }
    loadSubjects();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <main className={styles.contentWrapper}>
        {/* Header */}
        <div className={styles.headerWrapper}>
          <Link
            href="/"
            className={styles.backLink}
          >
            ← Back to Home
          </Link>
          <h1 className={styles.pageTitle}>
            Mathematics Practice
          </h1>
          <p className={styles.pageSubtitle}>
            Choose a subject to explore topics and begin your 7-stage journey
          </p>
        </div>

        {/* 7-Stage Journey Explanation */}
        <div className={styles.explanationCard}>
          <h2 className={styles.cardTitle}>
            Your 7-Stage Journey to Mastery
          </h2>
          <div className={styles.masteryGrid}>
            <div className={styles.stageRow}>
              <div className={styles.stageItem}>
                <div className={`${styles.masteryEmoji} hatsu`}>初</div>
                <h3 className={`${styles.masteryTitle} hatsu`}>
                  Hatsu
                </h3>
                <p className={styles.masteryDescription}>
                  First exposure
                </p>
              </div>
              <div className={styles.stageItem}>
                <div className={`${styles.masteryEmoji} shu`}>守</div>
                <h3 className={`${styles.masteryTitle} shu`}>
                  Shu
                </h3>
                <p className={styles.masteryDescription}>
                  Follow patterns
                </p>
              </div>
              <div className={styles.stageItem}>
                <div className={`${styles.masteryEmoji} kan`}>鑑</div>
                <h3 className={`${styles.masteryTitle} kan`}>
                  Kan
                </h3>
                <p className={styles.masteryDescription}>
                  Mirror & reflect
                </p>
              </div>
              <div className={styles.stageItem}>
                <div className={`${styles.masteryEmoji} ha`}>破</div>
                <h3 className={`${styles.masteryTitle} ha`}>
                  Ha
                </h3>
                <p className={styles.masteryDescription}>
                  Break patterns
                </p>
              </div>
            </div>
            <div className={styles.stageRow}>
              <div className={styles.stageItem}>
                <div className={`${styles.masteryEmoji} toi`}>問</div>
                <h3 className={`${styles.masteryTitle} toi`}>
                  Toi
                </h3>
                <p className={styles.masteryDescription}>
                  Deep inquiry
                </p>
              </div>
              <div className={styles.stageItem}>
                <div className={`${styles.masteryEmoji} ri`}>離</div>
                <h3 className={`${styles.masteryTitle} ri`}>
                  Ri
                </h3>
                <p className={styles.masteryDescription}>
                  Transcend rules
                </p>
              </div>
              <div className={styles.stageItem}>
                <div className={`${styles.masteryEmoji} ku`}>空</div>
                <h3 className={`${styles.masteryTitle} ku`}>
                  Ku
                </h3>
                <p className={styles.masteryDescription}>
                  Effortless mastery
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Subjects */}
        <div>
          <h2 className={styles.sectionTitle}>
            Choose a Subject
          </h2>
          {loading ? (
            <div className={styles.loading}>Loading subjects...</div>
          ) : (
            <div className={styles.moduleGrid}>
              {subjects.map((subject) => {
                const icon = SUBJECT_ICONS[subject.code] || '📚';
                return (
                  <Link
                    key={subject.subject_id}
                    href={`/practice/math/${subject.code}`}
                    className={styles.moduleCard}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.moduleEmoji}>{icon}</div>
                    </div>
                    <h3 className={styles.moduleTitle}>
                      {subject.display_name}
                    </h3>
                    <p className={styles.moduleDescription}>
                      Explore topics in {subject.display_name.toLowerCase()}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}