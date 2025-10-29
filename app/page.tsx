import { getRecentPracticeSessions } from '@/lib/supabase';

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

  // Fetch recent practice sessions from database
  const recentSessions = await getRecentPracticeSessions(10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
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
          {recentSessions.length === 0 ? (
            <div className="rounded-xl bg-white dark:bg-zinc-800 p-8 shadow-md border border-zinc-200 dark:border-zinc-700 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                No practice sessions yet. Start practicing to see your recent activity here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white">
                        {formatSubjectName(session.subject)}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {formatModuleName(session.module)} • {session.total_reps} reps • Level: {session.current_level.toUpperCase()}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500">
                      {formatRelativeDate(session.last_practiced_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Avg response: {session.session_avg_response_time}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
