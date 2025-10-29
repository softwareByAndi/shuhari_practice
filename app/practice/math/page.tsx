'use client';

import Link from 'next/link';
import { EQUATION_CONFIGS, type EquationType } from '@/lib/equation-types';

type ShuModule = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  level: 'shu' | 'ha' | 'ri';
  href: string;
  digitOptions: number[];
};

const shuModules: ShuModule[] = Object.values(EQUATION_CONFIGS).map((config) => ({
  id: config.id,
  title: config.title,
  description: config.description,
  emoji: config.emoji,
  level: 'shu' as const,
  href: `/practice/math/equations/${config.id}/practice?digits=1`,
  digitOptions: [1, 2, 3],
}));

export default function MathPractice() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-black">
      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-white mb-4">
            Mathematics Practice
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Choose a Shu (守) module to begin your practice journey
          </p>
        </div>

        {/* Shu Ha Ri Explanation */}
        <div className="mb-12 bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            The Path of Mastery: 守破離
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-4xl mb-2">守</div>
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                Shu (Obey)
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Learn the fundamentals through repetition and strict adherence to basic forms. Build muscle memory.
              </p>
            </div>
            <div className="opacity-50">
              <div className="text-4xl mb-2">破</div>
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                Ha (Break)
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Break from tradition. Experiment with variations and develop your own understanding.
              </p>
            </div>
            <div className="opacity-50">
              <div className="text-4xl mb-2">離</div>
              <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                Ri (Leave)
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Transcend all forms. Create your own path based on deep mastery and intuition.
              </p>
            </div>
          </div>
        </div>

        {/* Available Modules */}
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Available Shu Modules
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shuModules.map((module) => (
              <div
                key={module.id}
                className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-700"
              >
                <div className="text-6xl mb-4">{module.emoji}</div>
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                    守 {module.level.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  {module.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  {module.description}
                </p>

                {/* Digit selection */}
                <div className="mt-4">
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Choose difficulty:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {module.digitOptions.map((digits) => {
                      const min = digits === 1 ? 0 : Math.pow(10, digits - 1);
                      const max = Math.pow(10, digits) - 1;
                      return (
                        <Link
                          key={digits}
                          href={`/practice/math/equations/${module.id}/practice?digits=${digits}`}
                          className="flex items-center justify-center px-3 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors font-medium text-sm border-2 border-blue-700 dark:border-blue-400 active:scale-95 touch-manipulation"
                        >
                          {min}-{max}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
