'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTopicSummariesForUser, LocalTopicSummary } from '@/lib/local-session-storage';
import { ExtendedTopic, Stage } from '@/lib/types/database';
import { 
  topicLookup, 
  subjectLookup, 
  stageLookup, 
  calculateStageByReps 
} from '@/lib/local_db_lookup';

function DEBUG_LOG(msg: string) {
  console.log('[RecentPractice]', msg);
}

const data = {
  title: "Recent Practice",
}

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

interface ActiveTopicSummary extends LocalTopicSummary {
  topic: ExtendedTopic;
  currentStage: Stage;
}

export default function RecentPractice() {
  const { user, loading } = useAuth();
  const [recentTopics, setRecentTopics] = useState<ActiveTopicSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!!loading) {
      return;
    }

    DEBUG_LOG(`Loading recent practice for user: ${user?.id}`);

    try {
      const localTopics = getAllTopicSummariesForUser(user?.id || null);
      console.log('Local topics loaded:', localTopics);
      setRecentTopics(
        localTopics.map((topicSummary) => {
          const topicData = topicLookup.by_id[topicSummary.topicId];
          const currentStage = calculateStageByReps(topicSummary.totalReps);

          return {
            ...topicSummary,
            topic: topicData,
            currentStage
          };
        })
      );
      setIsLoading(false);
    }
    catch (error) {
      console.error('Error loading local practice data:', error);
    }
    setIsLoading(false);
  }, [user, loading]);



  return (
    <div className={styles.recentSection}>
      <h2 className={styles.sectionTitle}>{data.title}</h2>
      
      {(loading || isLoading) ? (

        <div className="rounded-xl bg-white dark:bg-zinc-800 p-8 shadow-md border border-zinc-200 dark:border-zinc-700 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>

      ) : (recentTopics.length === 0) ? (

        <div className="rounded-xl bg-white dark:bg-zinc-800 p-8 shadow-md border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            No practice sessions yet. Start practicing to see your recent activity here!
          </p>
        </div>

      ) : (

        <div className="space-y-4">
          {recentTopics.map((topicSummary) => {
            const url = `/practice/${topicSummary.topic.field.code}/${topicSummary.topic.subject.code}/${topicSummary.topic.code}?difficulty=TODO`
            const targetReps = topicSummary.currentStage.rep_threshold + topicSummary.currentStage.reps_in_stage;
            const progress = topicSummary.totalReps && targetReps
              ? Math.min(100, Math.floor((topicSummary.totalReps / targetReps) * 100))
              : 0;
            
            return (
              <Link
                key={topicSummary.topicId}
                href={url}
                className="block rounded-xl bg-white dark:bg-zinc-800 p-4 md:p-6 shadow-md border border-zinc-200 dark:border-zinc-700 hover:shadow-lg hover:scale-[1.01] transition-all"
              >
                <div className="flex flex-col mb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{topicSummary.topic.symbol}</span>
                    <h3 className="font-semibold text-zinc-900 dark:text-white md:text-lg">
                      {topicSummary.topic.display_name}
                    </h3>

                    {/* Stage badge */}
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded">
                      <span>{topicSummary.currentStage.symbol}</span>
                      <span className="hidden sm:inline">Stage {topicSummary.currentStage.stage_id}</span>
                    </div>

                    <div className="flex-grow"/>

                    <div className="text-right text-xs">
                      <span className="font-medium">{topicSummary.totalReps}</span>
                      <div className="text-zinc-400 dark:text-zinc-500">total reps</div>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between gap-2">
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">
                      {
                        topicSummary.mostRecentSessionDate 
                          ? formatRelativeDate(new Date(topicSummary.mostRecentSessionDate)) 
                          : 'Never practiced'
                      }
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">
                      {topicSummary.sessionsCount} sessions
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 text-right">
                    {topicSummary.totalReps} / {targetReps} to next stage
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