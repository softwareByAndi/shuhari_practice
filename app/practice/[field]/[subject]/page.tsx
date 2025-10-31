'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  getTopicsForSubject,
  getSubjectsForFieldCode
} from '@/lib/supabase-v2';
import {
  TopicWithProgress,
  Subject,
  STAGE_DISPLAY_NAMES,
  calculateProgress
} from '@/lib/types/database';
import styles from './page.module.css';

// Topic icons mapping
const TOPIC_ICONS: Record<string, string> = {
  'add': '➕',
  'sub': '➖',
  'mul': '✖️',
  'div': '➗',
  'mod': '%',
  'exp': '^',
  'root': '√',
  'add_w_negatives': '±',
  'subtract_w_negatives': '∓',
};

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [topics, setTopics] = useState<TopicWithProgress[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  const fieldCode = params.field as string;
  const subjectCode = params.subject as string;

  useEffect(() => {
    if (!user?.id) {
      router.push('/auth');
      return;
    }

    async function loadData() {
      try {
        // Get subjects for this field using the field code
        const subjects = await getSubjectsForFieldCode(fieldCode);
        const currentSubject = subjects.find((s: Subject) => s.code === subjectCode);

        if (!currentSubject) {
          console.error('Subject not found:', subjectCode);
          router.push(`/practice/${fieldCode}`);
          return;
        }

        setSubject(currentSubject);

        // Get topics with user progress
        const topicsData = await getTopicsForSubject(user!.id, currentSubject.subject_id);
        setTopics(topicsData);
      } catch (error) {
        console.error('Error loading topics:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, subjectCode, fieldCode, router]);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <main className={styles.contentWrapper}>
          <div className={styles.loading}>Loading topics...</div>
        </main>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className={styles.pageContainer}>
        <main className={styles.contentWrapper}>
          <div className={styles.error}>Subject not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.contentWrapper}>
        {/* Header */}
        <div className={styles.headerWrapper}>
          <Link
            href={`/practice/${fieldCode}`}
            className={styles.backLink}
          >
            ← Back to Subjects
          </Link>
          <h1 className={styles.pageTitle}>
            {subject.display_name}
          </h1>
          <p className={styles.pageSubtitle}>
            Choose a topic to practice. Progress through 7 stages from Hatsu to Ku.
          </p>
        </div>

        {/* Topics Grid */}
        <div className={styles.topicsSection}>
          <h2 className={styles.sectionTitle}>Topics</h2>
          <div className={styles.topicGrid}>
            {topics.map((topic) => {
              const currentStageId = topic.user_progress?.stage_id || 1;
              const icon = TOPIC_ICONS[topic.code] || '📚';
              const stageName = STAGE_DISPLAY_NAMES[currentStageId];

              // Get progress for current stage
              const progression = topic.difficulty_progression;
              let stageProgress = 0;
              let stageRequirement = 1000; // default

              if (progression && currentStageId <= 6) {
                const stageFields = ['hatsu', 'shu', 'kan', 'ha', 'toi', 'ri'] as const;
                const currentField = stageFields[currentStageId - 1];
                stageRequirement = progression[currentField] || 1000;
                stageProgress = calculateProgress(topic.total_reps || 0, stageRequirement);
              }

              return (
                <Link
                  key={topic.topic_id}
                  href={`/practice/${fieldCode}/${subjectCode}/${topic.code}?stage=${currentStageId}&difficulty=101`}
                  className={styles.topicCard}
                >
                  <div className={styles.topicHeader}>
                    <div className={styles.topicIcon}>{icon}</div>
                    <div className={styles.topicStage}>
                      <div className={styles.stageKanji}>
                        {stageName.split(' ')[0]}
                      </div>
                      <div className={styles.stageName}>
                        Stage {currentStageId}
                      </div>
                    </div>
                  </div>

                  <h3 className={styles.topicTitle}>
                    {topic.display_name}
                  </h3>

                  {/* Progress bar */}
                  <div className={styles.progressWrapper}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${stageProgress}%` }}
                      />
                    </div>
                    <div className={styles.progressText}>
                      {topic.total_reps || 0} / {stageRequirement} reps
                    </div>
                  </div>

                  {/* Stats */}
                  <div className={styles.topicStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Sessions:</span>
                      <span className={styles.statValue}>{topic.sessions_count || 0}</span>
                    </div>
                    {topic.last_practiced && (
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Last practiced:</span>
                        <span className={styles.statValue}>
                          {new Date(topic.last_practiced).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Difficulty options */}
                  {topic.difficulty_options && topic.difficulty_options.length > 0 && (
                    <div className={styles.difficultyIndicator}>
                      {topic.difficulty_options.map(diff => (
                        <span key={diff.difficulty_level_id} className={styles.difficultyDot}>
                          {diff.character}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stage Legend */}
        <div className={styles.legendSection}>
          <h3 className={styles.legendTitle}>Stage Progression</h3>
          <div className={styles.legendGrid}>
            {Object.entries(STAGE_DISPLAY_NAMES).map(([id, name]) => (
              <div key={id} className={styles.legendItem}>
                <span className={styles.legendKanji}>{name.split(' ')[0]}</span>
                <span className={styles.legendName}>{name.split(' - ')[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}