'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentTopicsWithProgress } from '@/lib/supabase-v2';
import { TopicWithProgress, STAGE_DISPLAY_NAMES, calculateProgress } from '@/lib/types/database';

const data = {
  title: "Recent Practice",
}



// Topic icons mapping (same as in subject page)
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

// Helper function to format date relative to now
function formatRelativeDate(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins <= 1 ? '1 minute ago' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export default function RecentPractice() {
  const { user, loading } = useAuth();
  const [recentTopics, setRecentTopics] = useState<TopicWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecentPractice() {
      console.log('Loading recent practice for user:', user?.id);
      if (user?.id) {
        try {
          const topics = await getRecentTopicsWithProgress(user.id, 5);
          console.log('Recent topics loaded:', topics);
          setRecentTopics(topics);
        } catch (error) {
          console.error('Error loading recent practice:', error);
          setRecentTopics([]);
        }
      } else {
        setRecentTopics([]);
      }
      setIsLoading(false);
    }

    if (!loading) {
      loadRecentPractice();
    }
  }, [user, loading]);

  return (
    <div className={styles.recentSection}>
      <h2 className={styles.sectionTitle}>{data.title}</h2>
      
      {(loading || isLoading) ? (

        <div className="rounded-xl bg-white dark:bg-zinc-800 p-8 shadow-md border border-zinc-200 dark:border-zinc-700 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>

      ) : (!user) ? (

        <div className="rounded-xl bg-white dark:bg-zinc-800 p-8 shadow-md border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Sign in to track your practice history and see your progress through 7 stages of mastery!
          </p>
          <a
            href="/auth"
            className="mt-4 inline-block px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Sign In to Track Progress
          </a>
        </div>

      ) : (recentTopics.length === 0) ? (

        <div className="rounded-xl bg-white dark:bg-zinc-800 p-8 shadow-md border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            No practice sessions yet. Start practicing to see your recent activity here!
          </p>
        </div>

      ) : (

        <div className="space-y-4">
          {recentTopics.map((topic) => {
            const currentStageId = topic.user_progress?.stage_id || 1;
            const stageName = STAGE_DISPLAY_NAMES[currentStageId];
            const icon = TOPIC_ICONS[topic.code] || '📚';

            // Get progress for current stage
            const progression = topic.difficulty_progression;
            let stageProgress = 0;
            let stageRequirement = 1000;

            if (progression && currentStageId <= 6) {
              const stageFields = ['hatsu', 'shu', 'kan', 'ha', 'toi', 'ri'] as const;
              const currentField = stageFields[currentStageId - 1];
              stageRequirement = (progression as any)[currentField] || 1000;
              stageProgress = calculateProgress(topic.total_reps || 0, stageRequirement);
            }

            // Build practice URL using the actual field and subject codes
            const subjectData = (topic as any).subject;
            const fieldData = subjectData?.field;
            const fieldCode = fieldData?.code || 'math'; // fallback to math if not found
            const subjectCode = subjectData?.code || 'arithmetic'; // fallback to arithmetic
            const practiceUrl = `/practice/${fieldCode}/${subjectCode}/${topic.code}?stage=${currentStageId}&difficulty=101`;

            return (
              <Link
                key={topic.topic_id}
                href={practiceUrl}
                className="block rounded-xl bg-white dark:bg-zinc-800 p-4 md:p-6 shadow-md border border-zinc-200 dark:border-zinc-700 hover:shadow-lg hover:scale-[1.01] transition-all"
              >
                <div className="flex flex-col mb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{icon}</span>
                    <h3 className="font-semibold text-zinc-900 dark:text-white md:text-lg">
                      {topic.display_name}
                    </h3>

                    {/* Stage badge */}
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded">
                      <span>{stageName.split(' ')[0]}</span>
                      <span className="hidden sm:inline">Stage {currentStageId}</span>
                    </div>

                    <div className="flex-grow"/>

                    <div className="text-right text-xs">
                      <span className="font-medium">{topic.total_reps || 0}</span>
                      <div className="text-zinc-400 dark:text-zinc-500">total reps</div>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between gap-2">
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">
                      {topic.last_practiced ? formatRelativeDate(topic.last_practiced) : 'Never practiced'}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">
                      {topic.sessions_count || 0} sessions
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${stageProgress}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 text-right">
                    {topic.total_reps || 0} / {stageRequirement} to next stage
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )
    }
    </div>
  );
}



const styles = {
  recentSection: 'mb-16',
  sectionTitle: 'text-2xl md:text-3xl font-bold mb-6 text-zinc-900 dark:text-white',
}