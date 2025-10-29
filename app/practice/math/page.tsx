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
};

const shuModules: ShuModule[] = Object.values(EQUATION_CONFIGS).map((config) => ({
  id: config.id,
  title: config.title,
  description: config.description,
  emoji: config.emoji,
  level: 'shu' as const,
  href: `/practice/math/equations/${config.id}`,
}));

export default function MathPractice() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-black">
      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
            Mathematics Practice
          </h1>
          <p className="text-sm md:text-xl text-zinc-600 dark:text-zinc-400">
            Choose a Shu (守) module to begin your practice journey
          </p>
        </div>

        {/* Shu Ha Ri Explanation */}
        <div className="mb-12 bg-white dark:bg-zinc-800 rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-center text-xl md:text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            The Path of Mastery: 守破離
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-4xl mb-2 text-center">守</div>
              <h3 className="text-md md:text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2 text-center">
                Shu (Obey)
              </h3>
              <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                Learn the fundamentals through repetition and strict adherence to basic forms. Build muscle memory.
              </p>
            </div>
            <div className="opacity-50">
              <div className="text-4xl mb-2 text-center">破</div>
              <h3 className="text-md md:text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2 text-center">
                Ha (Break)
              </h3>
              <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                Break from tradition. Experiment with variations and develop your own understanding.
              </p>
            </div>
            <div className="opacity-50">
              <div className="text-4xl mb-2 text-center">離</div>
              <h3 className="text-md md:text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2 text-center">
                Ri (Leave)
              </h3>
              <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
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
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {shuModules.map((module) => (
              <Link
                key={module.id}
                href={module.href}
                className="block bg-white dark:bg-zinc-800 rounded-2xl py-6 px-4 shadow-lg border border-zinc-200 dark:border-zinc-700 
                          hover:shadow-xl hover:scale-105 transition-all group"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="text-5xl">{module.emoji}</div>
                  <div className ="flex flex-col h-fit items-center px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 
                                  text-3xl font-semibold rounded-full">
                    <div>守</div>
                    {/* <div>{module.level.toUpperCase()}</div> */}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {module.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {module.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
