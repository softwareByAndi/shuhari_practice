'use client';

import Link from 'next/link';
import { EQUATION_CONFIGS, type EquationType } from '@/lib/equation-types';
import styles from './page.module.css';

type ShuModule = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  level: 'shu' | 'ha' | 'ri';
  href: string;
};

const shuModules: ShuModule[] = Object.values(EQUATION_CONFIGS).map((config) => ({
  id: config.id,
  title: config.title,
  description: config.description,
  emoji: config.emoji,
  level: 'shu' as const,
  href: `/practice/math/equations/${config.id}`,
}));

export default function MathPractice() {
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
            Choose a Shu (守) module to begin your practice journey
          </p>
        </div>

        {/* Shu Ha Ri Explanation */}
        <div className={styles.explanationCard}>
          <h2 className={styles.cardTitle}>
            The Path of Mastery: 守破離
          </h2>
          <div className={styles.masteryGrid}>
            <div>
              <div className={`${styles.masteryEmoji} shu`}>守</div>
              <h3 className={`${styles.masteryTitle} shu`}>
                Shu (Obey)
              </h3>
              <p className={styles.masteryDescription}>
                Learn the fundamentals through repetition and strict adherence to basic forms. Build muscle memory.
              </p>
            </div>
            <div className={styles.masteryDisabled}>
              <div className={`${styles.masteryEmoji} ha`}>破</div>
              <h3 className={`${styles.masteryTitle} ha`}>
                Ha (Break)
              </h3>
              <p className={styles.masteryDescription}>
                Break from tradition. Experiment with variations and develop your own understanding.
              </p>
            </div>
            <div className={styles.masteryDisabled}>
              <div className={`${styles.masteryEmoji} ri`}>離</div>
              <h3 className={`${styles.masteryTitle} ri`}>
                Ri (Leave)
              </h3>
              <p className={styles.masteryDescription}>
                Transcend all forms. Create your own path based on deep mastery and intuition.
              </p>
            </div>
          </div>
        </div>

        {/* Available Modules */}
        <div>
          <h2 className={styles.sectionTitle}>
            Available Shu Modules
          </h2>
          <div className={styles.moduleGrid}>
            {shuModules.map((module) => (
              <Link
                key={module.id}
                href={module.href}
                className={styles.moduleCard}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.moduleEmoji}>{module.emoji}</div>
                  <div className={styles.levelBadge}>
                    <div>守</div>
                    {/* <div>{module.level.toUpperCase()}</div> */}
                  </div>
                </div>
                <h3 className={styles.moduleTitle}>
                  {module.title}
                </h3>
                <p className={styles.moduleDescription}>
                  {module.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
