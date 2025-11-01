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

  return (<></>);

  // return (
  //   <div className="flex items-center gap-4 px-4 py-2">
  //     {user ? (
  //       <div className="flex flex-col items-end">
  //         <button
  //           onClick={handleSignOut}
  //           className="text-sm font-medium rounded-lg transition-colors
  //               text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 
  //               dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800"
  //         >
  //           Sign Out
  //         </button>
  //         <span className="text-xs text-zinc-600 dark:text-zinc-500">
  //           {user.email}
  //         </span>
  //       </div>
  //     ) : (
  //       <a
  //         href="/auth"
  //         className="px-4 py-2 text-sm font-medium 
  //             text-white bg-blue-600 hover:bg-blue-700 
  //             rounded-lg transition-colors"
  //       >
  //         Sign In
  //       </a>
  //     )}
  //   </div>
  // );
}
