'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEquationConfig, isValidEquationType } from '@/lib/equation-types';

type DifficultyLevel = {
  digits: number;
  label: string;
  range: string;
  example: string;
};

export default function EquationDifficultySelection() {
  const params = useParams();
  const equationType = params.type as string;

  // Validate equation type
  if (!isValidEquationType(equationType)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
            Invalid equation type: {equationType}
          </p>
          <Link
            href="/practice/math"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Math Practice
          </Link>
        </div>
      </div>
    );
  }

  const config = getEquationConfig(equationType);
  if (!config) return null;

  // Generate examples based on equation type
  const generateExample = (digits: number): string => {
    if (config.id === 'root') {
      if (digits === 1) return `${config.operator}25 = ?`;
      if (digits === 2) return `${config.operator}144 = ?`;
      return `${config.operator}1225 = ?`;
    }
    if (config.id === 'exp') {
      if (digits === 1) return `5${config.operator}3 = ?`;
      if (digits === 2) return `7${config.operator}3 = ?`;
      return `12${config.operator}2 = ?`;
    }
    if (config.id === 'add_w_negatives' || config.id === 'subtract_w_negatives') {
      if (digits === 1) return `-5 ${config.operator} 7 = ?`;
      if (digits === 2) return `-47 ${config.operator} 83 = ?`;
      return `-347 ${config.operator} 583 = ?`;
    }
    // Default examples
    if (digits === 1) return `5 ${config.operator} 7 = ?`;
    if (digits === 2) return `47 ${config.operator} 83 = ?`;
    return `347 ${config.operator} 583 = ?`;
  };

  const getRangeLabel = (digits: number): string => {
    if (config.id === 'exp') {
      if (digits === 1) return 'Base: 2-9';
      if (digits === 2) return 'Base: 2-12';
      return 'Base: 2-15';
    }
    if (config.id === 'root') {
      if (digits === 1) return 'Result: 1-9';
      if (digits === 2) return 'Result: 10-31';
      return 'Result: 32-99';
    }
    if (config.id === 'add_w_negatives' || config.id === 'subtract_w_negatives') {
      if (digits === 1) return '-9 to 9';
      if (digits === 2) return '-99 to 99';
      return '-999 to 999';
    }
    if (digits === 1) return '0-9';
    if (digits === 2) return '10-99';
    return '100-999';
  };

  const difficultyLevels: DifficultyLevel[] = [
    {
      digits: 1,
      label: 'Beginner',
      range: getRangeLabel(1),
      example: generateExample(1),
    },
    {
      digits: 2,
      label: 'Intermediate',
      range: getRangeLabel(2),
      example: generateExample(2),
    },
    {
      digits: 3,
      label: 'Advanced',
      range: getRangeLabel(3),
      example: generateExample(3),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-black">
      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/practice/math"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            ← Back to Math Practice
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{config.emoji}</div>
            <div>
              <h1 className="text-5xl font-bold text-zinc-900 dark:text-white">
                {config.title}
              </h1>
              <p className="text-xl text-zinc-600 dark:text-zinc-400 mt-2">
                {config.description}
              </p>
            </div>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Choose Your Difficulty Level
          </h2>
          <div className="grid gap-6">
            {difficultyLevels.map((level) => (
              <Link
                key={level.digits}
                href={`/practice/math/equations/${equationType}/practice?digits=${level.digits}`}
                className="block bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg border-2 border-zinc-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-3xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {level.label}
                      </h3>
                      <span className="px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-full">
                        {level.range}
                      </span>
                    </div>
                    <p className="text-2xl text-zinc-600 dark:text-zinc-400 font-mono">
                      Example: {level.example}
                    </p>
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 group-hover:translate-x-2 transition-transform text-4xl">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
            💡 Practice Tip
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Start with Beginner level and master it with 1000 repetitions before moving to the next difficulty.
            Consistent practice builds speed and accuracy!
          </p>
        </div>
      </main>
    </div>
  );
}
