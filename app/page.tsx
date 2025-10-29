import Link from 'next/link';
import { getRecentModulesWithHistory, type ModuleSummary } from '@/lib/supabase';
import { EQUATION_CONFIGS } from '@/lib/equation-types';
import Header from '@/components/Header';

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

// Helper function to format subject name
function formatSubjectName(subject: string): string {
  return subject.charAt(0).toUpperCase() + subject.slice(1);
}

export default async function Home() {
  const subjects = [
    { name: 'Mathematics', icon: '🔢', href: '/practice/math', color: 'bg-blue-500', enabled: true },
    { name: 'Chemistry', icon: '⚗️', href: '/practice/chemistry', color: 'bg-green-500', enabled: false },
    { name: 'Biology', icon: '🧬', href: '/practice/biology', color: 'bg-emerald-500', enabled: false },
    { name: 'Programming', icon: '💻', href: '/practice/programming', color: 'bg-purple-500', enabled: false },
    { name: 'Physics', icon: '⚛️', href: '/practice/physics', color: 'bg-indigo-500', enabled: false },
    { name: 'History', icon: '📜', href: '/practice/history', color: 'bg-amber-500', enabled: false },
  ];

  // Fetch recent practice modules with history from database
  const recentModules = await getRecentModulesWithHistory(10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
            ShuHaRi Learning
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl">
            Master any subject through the ancient martial arts principle of learning
          </p>
        </div>

        {/* ShuHaRi Explanation */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white dark:bg-zinc-800 p-6 shadow-lg border border-zinc-200 dark:border-zinc-700">
            <div className="text-3xl mb-3">守</div>
            <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">Shu (守) - Obey</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Learn the fundamentals and follow traditional wisdom. Build a strong foundation through repetition and adherence to proven methods.
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-zinc-800 p-6 shadow-lg border border-zinc-200 dark:border-zinc-700">
            <div className="text-3xl mb-3">破</div>
            <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">Ha (破) - Break</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Question and expand upon the basics. Explore variations and adapt techniques to find what works best for you.
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-zinc-800 p-6 shadow-lg border border-zinc-200 dark:border-zinc-700">
            <div className="text-3xl mb-3">離</div>
            <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">Ri (離) - Leave</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Transcend the rules and make the knowledge your own. Create innovative solutions and teach others.
            </p>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white">Choose Your Subject</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              subject.enabled ? (
                <a
                  key={subject.name}
                  href={subject.href}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 p-6 shadow-lg border border-zinc-200 dark:border-zinc-700 transition-all hover:scale-105 hover:shadow-xl"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 ${subject.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                  <div className="relative">
                    <div className="text-5xl mb-4">{subject.icon}</div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                      Start your journey →
                    </p>
                  </div>
                </a>
              ) : (
                <div
                  key={subject.name}
                  className="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 p-6 shadow-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 opacity-60 cursor-not-allowed"
                >
                  <div className="relative">
                    <div className="text-5xl mb-4 grayscale">{subject.icon}</div>
                    <h3 className="text-xl font-semibold text-zinc-600 dark:text-zinc-500">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-2">
                      Coming soon...
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white">Recent Practice</h2>
          {recentModules.length === 0 ? (
            <div className="rounded-xl bg-white dark:bg-zinc-800 p-8 shadow-md border border-zinc-200 dark:border-zinc-700 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                No practice sessions yet. Start practicing to see your recent activity here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentModules.map((module) => {
                // Calculate progress percentage toward completing Shu level (1000 reps)
                const progressPercentage = Math.min((module.module_total_reps / 1000) * 100, 100);
                const moduleKey = `${module.user_id}-${module.subject}-${module.module}`;

                // Extract equation type and digits from module name
                // Module format: equations-{type}-{digits}d (e.g., "equations-subtraction-1d")
                const moduleMatch = module.module.match(/^equations-([^-]+)-(\d+)d$/);
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
                    className="block rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md border border-zinc-200 dark:border-zinc-700 hover:shadow-lg hover:scale-[1.01] transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-zinc-900 dark:text-white text-lg">
                            {displayName}
                          </h3>
                          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                            {difficulty}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">
                          {formatRelativeDate(module.last_practiced_at)}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 ml-4 flex flex-col items-end gap-2">
                        <div className="text-right">
                          <span className="font-medium">{module.latest_avg_response_time}ms</span>
                          <div className="text-zinc-400 dark:text-zinc-500">avg response</div>
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
                    <div className="mt-4">
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
          )}
        </div>
      </main>
    </div>
  );
}
