'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentModulesWithHistory, type ModuleSummary } from '@/lib/supabase';
import { EQUATION_CONFIGS } from '@/lib/equation-types';

// Simple sparkline component for response time trend
function ResponseTimeTrend({ history, latest }: { history: number[]; latest: number }) {
  if (history.length === 0) return null;

  const max = Math.max(...history);
  const min = Math.min(...history);
  const range = max - min || 1; // Avoid division by zero

  // Generate SVG path for the sparkline
  const width = 100;
  const height = 24;
  const points = history.map((value, index) => {
    const x = (index / (history.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  // Determine trend direction (comparing latest to first)
  const isImproving = history.length > 1 && latest < history[0];
  const trendColor = isImproving ? 'text-green-500' : 'text-zinc-400';
  const lineColor = isImproving ? '#22c55e' : '#a1a1aa';

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} className="opacity-70">
        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`text-2xl ${trendColor}`}>
        {isImproving ? '↓' : '→'}
      </span>
    </div>
  );
}

// Helper function to format date relative to now
function formatRelativeDate(dateString: string): string {
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

// Helper function to format module name
function formatModuleName(module: string): string {
  return module.charAt(0).toUpperCase() + module.slice(1);
}

export default function RecentPractice() {
  const { user, loading } = useAuth();
  const [recentModules, setRecentModules] = useState<ModuleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecentPractice() {
      // Only fetch if user is authenticated
      if (user?.id) {
        const modules = await getRecentModulesWithHistory(10);
        setRecentModules(modules);
      } else {
        setRecentModules([]);
      }
      setIsLoading(false);
    }

    if (!loading) {
      loadRecentPractice();
    }
  }, [user, loading]);

  if (loading || isLoading) {
    return (
      <div className="rounded-xl bg-white dark:bg-zinc-800 p-8 shadow-md border border-zinc-200 dark:border-zinc-700 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl bg-white dark:bg-zinc-800 p-8 shadow-md border border-zinc-200 dark:border-zinc-700 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          Sign in to track your practice history and see your progress over time!
        </p>
        <a
          href="/auth"
          className="mt-4 inline-block px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Sign In to Track Progress
        </a>
      </div>
    );
  }

  if (recentModules.length === 0) {
    return (
      <div className="rounded-xl bg-white dark:bg-zinc-800 p-8 shadow-md border border-zinc-200 dark:border-zinc-700 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          No practice sessions yet. Start practicing to see your recent activity here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentModules.map((module) => {
        // Calculate progress percentage toward completing Shu level (1000 reps)
        const progressPercentage = Math.min((module.module_total_reps / 1000) * 100, 100);
        const moduleKey = `${module.user_id}-${module.subject}-${module.module}`;

        // Extract equation type and digits from module name
        // Module format: equations-{type}-{digits}d (e.g., "equations-subtraction-1d")
        const moduleMatch = module.module.match(/^equations-(.+)-(\d+)d$/);
        const equationType = moduleMatch ? moduleMatch[1] : module.module;
        const digits = moduleMatch ? moduleMatch[2] : '1';

        // Map digits to difficulty level
        const difficultyMap: Record<string, string> = {
          '1': 'Beginner',
          '2': 'Intermediate',
          '3': 'Advanced',
        };
        const difficulty = difficultyMap[digits] || 'Beginner';

        // Get the equation config to extract the display name
        const equationConfig = EQUATION_CONFIGS[equationType as keyof typeof EQUATION_CONFIGS];
        const displayName = equationConfig
          ? `${equationConfig.emoji} ${equationConfig.title}`
          : formatModuleName(equationType);

        // Build the practice page URL with digits parameter to go straight to practice
        const practiceUrl = `/practice/${module.subject}/equations/${equationType}/practice?digits=${digits}`;

        return (
          <Link
            key={moduleKey}
            href={practiceUrl}
            className="block rounded-xl bg-white dark:bg-zinc-800 p-4 md:p-6 shadow-md border border-zinc-200 dark:border-zinc-700 hover:shadow-lg hover:scale-[1.01] transition-all"
          >
            <div className="flex flex-col  mb-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-zinc-900 dark:text-white md:text-lg">
                  {displayName}
                </h3>
                <div className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                  {difficulty}
                </div>

                <div className="flex-grow"/>

                <div className="text-right text-xs">
                  <span className="font-medium">{module.latest_avg_response_time}ms</span>
                  <div className="text-zinc-400 dark:text-zinc-500">avg response</div>
                </div>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start justify-between gap-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-500">
                  {formatRelativeDate(module.last_practiced_at)}
                </div>
                {module.response_time_history.length > 1 && (
                  <ResponseTimeTrend
                    history={module.response_time_history}
                    latest={module.latest_avg_response_time}
                  />
                )}
              </div>
            </div>
            {/* Progress bar */}
            <div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
