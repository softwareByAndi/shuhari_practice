'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
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
  );
}
