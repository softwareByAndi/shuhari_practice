'use client';

import { useState, useEffect } from 'react';
import { generateProblems, getComplexitySettings, Problem } from '@/lib/problem-generator-v3';
import { getEquationConfig, EQUATION_CONFIGS, EquationType } from '@/lib/equation-types';

export default function ProblemGeneratorTestPage() {
  // Form inputs
  const [topicCode, setTopicCode] = useState<string>('add');
  const [digitCount1, setDigitCount1] = useState<number>(2);
  const [digitCount2, setDigitCount2] = useState<number>(2);
  const [maxProblemCount, setMaxProblemCount] = useState<number>(100);
  const [allowNegatives, setAllowNegatives] = useState<boolean>(false);
  const [allowDecimals, setAllowDecimals] = useState<boolean>(false);

  // Results
  const [problems, setProblems] = useState<Problem[]>([]);
  const [complexitySettings, setComplexitySettings] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate problems whenever inputs change
  useEffect(() => {
    generateNewProblems();
  }, [topicCode, digitCount1, digitCount2, maxProblemCount, allowNegatives, allowDecimals]);

  const generateNewProblems = () => {
    try {
      setError(null);

      const equationConfig = getEquationConfig(topicCode);

      if (!equationConfig) {
        setError(`Invalid topic code: ${topicCode}`);
        setProblems([]);
        setComplexitySettings(null);
        return;
      }

      const complexity = getComplexitySettings(
        topicCode,
        digitCount1,
        digitCount2,
        maxProblemCount,
        {
          allowNegatives,
          allowDecimals
        }
      );

      setComplexitySettings(complexity);

      const problemSet = generateProblems({
        topicCode,
        equationConfig,
        complexity,
      });

      setProblems(problemSet);

      console.log('Generated Problems:', problemSet);
      console.log('Complexity Settings:', complexity);
    } catch (err) {
      console.error('Error generating problems:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProblems([]);
      setComplexitySettings(null);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Problem Generator Test Page</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Panel */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>

          <div className="space-y-4">
            {/* Topic Code Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Topic Code
              </label>
              <select
                value={topicCode}
                onChange={(e) => setTopicCode(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {Object.keys(EQUATION_CONFIGS).map((key) => (
                  <option key={key} value={key}>
                    {key} - {EQUATION_CONFIGS[key as EquationType].title}
                  </option>
                ))}
                {/* Add special topic codes with modifiers */}
                <option value="add_w_neg">add_w_neg - Addition with Negatives (auto)</option>
                <option value="sub_w_dec">sub_w_dec - Subtraction with Decimals (auto)</option>
              </select>
            </div>

            {/* Digit Counts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Digit Count 1
                </label>
                <input
                  type="number"
                  value={digitCount1}
                  onChange={(e) => setDigitCount1(parseInt(e.target.value) || 1)}
                  min="1"
                  max="5"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Digit Count 2
                </label>
                <input
                  type="number"
                  value={digitCount2}
                  onChange={(e) => setDigitCount2(parseInt(e.target.value) || 1)}
                  min="1"
                  max="5"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Max Problem Count */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Problem Count
              </label>
              <input
                type="number"
                value={maxProblemCount}
                onChange={(e) => setMaxProblemCount(parseInt(e.target.value) || 100)}
                min="1"
                max="10000"
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Flags */}
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allowNegatives}
                  onChange={(e) => setAllowNegatives(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Allow Negatives</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allowDecimals}
                  onChange={(e) => setAllowDecimals(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Allow Decimals</span>
              </label>
            </div>

            {/* Manual Regenerate Button */}
            <button
              onClick={generateNewProblems}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Regenerate Problems
            </button>
          </div>

          {/* Debug Info */}
          {complexitySettings && (
            <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
              <h3 className="font-semibold mb-2">Complexity Settings</h3>
              <pre className="whitespace-pre-wrap overflow-auto">
                {JSON.stringify(complexitySettings, null, 2)}
              </pre>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              Error: {error}
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Generated Problems ({problems.length})
          </h2>

          {/* Statistics */}
          {problems.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>Total Problems: {problems.length}</div>
                <div>Unique Answers: {new Set(problems.map(p => p.answer)).size}</div>
                <div>
                  Answer Range: {Math.min(...problems.map(p => p.answer))} to{' '}
                  {Math.max(...problems.map(p => p.answer))}
                </div>
                <div>
                  Has Negatives: {problems.some(p => p.answer < 0) ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          )}

          {/* Problems List */}
          <div className="max-h-[600px] overflow-y-auto">
            {problems.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {problems.map((problem, index) => (
                  <div
                    key={index}
                    className="p-2 bg-white border rounded flex justify-between items-center hover:bg-gray-50"
                  >
                    <span className="text-gray-500 mr-2">#{index + 1}</span>
                    <span className="font-mono flex-1">{problem.display}</span>
                    <span className="font-bold text-blue-600">= {problem.answer}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                No problems generated yet
              </div>
            )}
          </div>

          {/* Export/Copy Button */}
          {problems.length > 0 && (
            <button
              onClick={() => {
                const problemsText = problems
                  .map((p, i) => `${i + 1}. ${p.display} = ${p.answer}`)
                  .join('\n');
                navigator.clipboard.writeText(problemsText);
                alert('Problems copied to clipboard!');
              }}
              className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
            >
              Copy Problems to Clipboard
            </button>
          )}
        </div>
      </div>

      {/* Raw Data Panel */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Raw Problem Data (First 10)</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs">
          {JSON.stringify(problems.slice(0, 10), null, 2)}
        </pre>
      </div>
    </div>
  );
}