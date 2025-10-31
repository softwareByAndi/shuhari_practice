'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import stage_styles from '@/styles/stage.module.css'

export default function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center w-fit">
            <span className={`${stage_styles.shu}`}>守</span>
            <span className={`${stage_styles.ha}`}>破</span>
            <span className={`${stage_styles.ri}`}>離</span>
            <div className="text-xs m-0 text-zinc-500">Shuhari</div>
          </a>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <a
                href="/auth"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
