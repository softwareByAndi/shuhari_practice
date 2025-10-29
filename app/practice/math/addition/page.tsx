'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  createPracticeSession,
  updatePracticeSession,
  getTotalRepsForModule,
  getLastSessionAvgResponseTime,
  type PracticeSession,
} from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

type Problem = { num1: number; num2: number };

function AdditionPracticeContent() {
  const { user } = useAuth();
  const [problemSet, setProblemSet] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved'>('idle');
  const [allTimeReps, setAllTimeReps] = useState(0);
  const [sessionReps, setSessionReps] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [lastSessionAvg, setLastSessionAvg] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const problemStartTimeRef = useRef<number>(Date.now());

  // Generate all 100 combinations of 0-9 + 0-9
  const generateAllProblems = (): Problem[] => {
    const problems: Problem[] = [];
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 9; j++) {
        problems.push({ num1: i, num2: j });
      }
    }
    return problems;
  };

  // Fisher-Yates shuffle
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize or reset problem set
  const initializeProblemSet = () => {
    const allProblems = generateAllProblems();
    const shuffled = shuffleArray(allProblems);
    setProblemSet(shuffled);
    setCurrentIndex(0);
    return shuffled;
  };

  // Debounced save function
  const debouncedSave = useCallback(async (
    sessionId: string,
    userId: string,
    totalReps: number,
    responseTimes: number[]
  ) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set status to pending
    setSaveStatus('pending');

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');

      // Calculate average response time
      const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

      await updatePracticeSession(sessionId, {
        total_reps: totalReps,
        session_avg_response_time: avgResponseTime,
      });

      // Refresh all-time reps
      const updatedAllTimeReps = await getTotalRepsForModule(userId, 'math', 'addition');
      setAllTimeReps(updatedAllTimeReps);

      setSaveStatus('saved');

      // Clear saved status after 2 seconds
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
      saveStatusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 3000);
  }, []);

  // Load next problem
  const loadNextProblem = async () => {
    let problems = problemSet;
    let index = currentIndex;

    // If we've reached the end of the set, shuffle and restart
    if (index >= problems.length) {
      setShowCongrats(true);
      problems = initializeProblemSet();
      index = 0;

      // Immediate save on set completion (bypass debounce)
      if (sessionId && userId) {
        const totalReps = sessionReps;
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        setSaveStatus('saving');

        // Calculate average response time
        const avgResponseTime = responseTimes.length > 0
          ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
          : 0;

        await updatePracticeSession(sessionId, {
          total_reps: totalReps,
          session_avg_response_time: avgResponseTime,
        });

        // Refresh all-time reps
        const updatedAllTimeReps = await getTotalRepsForModule(userId, 'math', 'addition');
        setAllTimeReps(updatedAllTimeReps);

        setSaveStatus('saved');

        // Clear saved status after 2 seconds
        if (saveStatusTimeoutRef.current) {
          clearTimeout(saveStatusTimeoutRef.current);
        }
        saveStatusTimeoutRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }

      setTimeout(() => {
        setShowCongrats(false);
      }, 3000);
    }

    const problem = problems[index];
    setNum1(problem.num1);
    setNum2(problem.num2);
    setAnswer('');
    setFeedback(null);
    setCurrentIndex(index + 1);

    // Reset timer for new problem
    problemStartTimeRef.current = Date.now();
  };

  // Initialize user and load progress from database
  useEffect(() => {
    async function initializeSession() {
      try {
        if (!user?.id) {
          setIsLoading(false);
          return;
        }

        // Load all-time reps and last session average
        const totalReps = await getTotalRepsForModule(user.id, 'math', 'addition');
        setAllTimeReps(totalReps);

        const lastAvg = await getLastSessionAvgResponseTime(user.id, 'math', 'addition');
        setLastSessionAvg(lastAvg);

        // Initialize problem set
        const problems = initializeProblemSet();
        if (problems.length > 0) {
          setNum1(problems[0].num1);
          setNum2(problems[0].num2);
          setCurrentIndex(1);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing session:', error);
        setIsLoading(false);
      }
    }

    initializeSession();
  }, [user]);

  // Cleanup: save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  const handleNumberClick = async (num: number) => {
    // Prevent input during feedback animation
    if (feedback === 'correct') return;

    const newAnswer = answer + num.toString();
    setAnswer(newAnswer);

    // Auto-submit if answer length matches the correct answer
    const correctAnswer = num1 + num2;
    const userAnswer = parseInt(newAnswer);

    if (!isNaN(userAnswer) && newAnswer.length >= correctAnswer.toString().length) {
      if (userAnswer === correctAnswer) {
        setFeedback('correct');

        // Track response time
        const responseTime = Date.now() - problemStartTimeRef.current;

        // Calculate current average and check if this response time should be included
        let newResponseTimes = [...responseTimes];
        if (responseTimes.length > 0) {
          // Use current session average
          const currentAvg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
          // Only include if less than 5x the average (excludes outliers like leaving tab)
          if (responseTime < currentAvg * 5) {
            newResponseTimes.push(responseTime);
          }
        } else if (lastSessionAvg > 0) {
          // Use previous session average if current session has no data yet
          if (responseTime < lastSessionAvg * 5) {
            newResponseTimes.push(responseTime);
          }
        } else {
          // Always include the first response if no previous session data
          newResponseTimes.push(responseTime);
        }
        setResponseTimes(newResponseTimes);

        // Increment session reps
        const newSessionReps = sessionReps + 1;
        setSessionReps(newSessionReps);

        // Create session on first correct answer if not already created
        const handleSave = async () => {
          if (!sessionId && user?.id) {
            const session = await createPracticeSession(user.id, 'math', 'addition');
            if (session) {
              setSessionId(session.id);
              // Now save with the new session ID
              debouncedSave(session.id, user.id, newSessionReps, newResponseTimes);
            }
          } else if (sessionId && user?.id) {
            debouncedSave(sessionId, user.id, newSessionReps, newResponseTimes);
          }
        };

        handleSave();

        // Remove focus from button to prevent highlight
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        // Load next problem immediately, feedback will flash briefly
        setTimeout(() => {
          loadNextProblem();
        }, 200);
      }
    }
  };

  const handleClear = () => {
    setAnswer('');
  };

  const handleBackspace = () => {
    setAnswer(answer.slice(0, -1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer) return;

    const userAnswer = parseInt(answer);
    const correctAnswer = num1 + num2;
    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
      setFeedback('correct');

      // Track response time
      const responseTime = Date.now() - problemStartTimeRef.current;

      // Calculate current average and check if this response time should be included
      let newResponseTimes = [...responseTimes];
      if (responseTimes.length > 0) {
        // Use current session average
        const currentAvg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        // Only include if less than 5x the average (excludes outliers like leaving tab)
        if (responseTime < currentAvg * 5) {
          newResponseTimes.push(responseTime);
        }
      } else if (lastSessionAvg > 0) {
        // Use previous session average if current session has no data yet
        if (responseTime < lastSessionAvg * 5) {
          newResponseTimes.push(responseTime);
        }
      } else {
        // Always include the first response if no previous session data
        newResponseTimes.push(responseTime);
      }
      setResponseTimes(newResponseTimes);

      // Increment session reps
      const newSessionReps = sessionReps + 1;
      setSessionReps(newSessionReps);

      // Create session on first correct answer if not already created
      const handleSave = async () => {
        if (!sessionId && user?.id) {
          const session = await createPracticeSession(user.id, 'math', 'addition');
          if (session) {
            setSessionId(session.id);
            // Now save with the new session ID
            debouncedSave(session.id, user.id, newSessionReps, newResponseTimes);
          }
        } else if (sessionId && user?.id) {
          debouncedSave(sessionId, user.id, newSessionReps, newResponseTimes);
        }
      };

      handleSave();

      setTimeout(() => {
        loadNextProblem();
      }, 200);
    } else {
      setFeedback('incorrect');

      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    }
  };

  const progressToHa = Math.min((allTimeReps / 1000) * 100, 100);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">Loading your practice session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-black">
      {/* Save Status Indicator */}
      {saveStatus !== 'idle' && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-full px-4 py-2 shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
            {saveStatus === 'pending' && (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Unsaved changes</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400">Saved!</span>
              </>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/practice/math"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            ← Back to Math Practice
          </Link>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            Addition Practice
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Single Digit Addition (0-9 + 0-9)
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-md border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Session Reps</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{sessionReps}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-md border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Reps</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{allTimeReps}</p>
          </div>
        </div>

        {/* Congratulations Modal */}
        {showCongrats && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-700 max-w-md w-full text-center animate-bounce">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                Set Complete!
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
                You've completed all 100 problems!
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Session reps: <span className="font-bold text-blue-600 dark:text-blue-400">{sessionReps}</span>
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total reps: <span className="font-bold text-indigo-600 dark:text-indigo-400">{allTimeReps}</span> / 1000
              </p>
            </div>
          </div>
        )}

        {/* Problem Card */}
        <div className={`rounded-2xl p-12 shadow-xl border transition-colors duration-200 ${
          feedback === 'correct'
            ? 'bg-green-300 dark:bg-green-600 border-green-400 dark:border-green-500'
            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
        }`}>
          <div className="text-center mb-8">
            <div className="text-7xl font-bold text-zinc-900 dark:text-white mb-6">
              {num1} + {num2} = ?
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="w-full text-5xl text-center p-6 border-2 border-zinc-300 dark:border-zinc-600 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white mb-6 min-h-[80px] flex items-center justify-center font-bold">
              {answer || '?'}
            </div>

            {/* Custom Numpad */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumberClick(num)}
                  disabled={feedback === 'correct'}
                  className="text-3xl font-semibold py-6 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                disabled={feedback === 'correct'}
                className="text-xl font-semibold py-6 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                Clear
              </button>
              <button
                key={0}
                type="button"
                onClick={() => handleNumberClick(0)}
                disabled={feedback === 'correct'}
                className="text-3xl font-semibold py-6 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                disabled={feedback === 'correct'}
                className="text-xl font-semibold py-6 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                ←
              </button>
            </div>

            <button
              type="submit"
              disabled={!answer || feedback === 'correct'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white font-semibold py-5 rounded-xl transition-colors text-xl disabled:cursor-not-allowed active:scale-95"
            >
              Check Answer
            </button>
          </form>

          {/* Feedback */}
          {feedback && (
            <div className={`mt-6 text-center text-xl font-semibold ${
              feedback === 'correct'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {feedback === 'correct' ? '✓ Correct! Great job!' : '✗ Not quite, try again!'}
            </div>
          )}
        </div>

        {/* Shu Ha Ri Progress Indicator */}
        <div className="mt-8 bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
            Your Progress: 守 Shu (Obey)
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
            Master the fundamentals through repetition. Complete 1000 reps to reach Ha (破) level!
          </p>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all"
              style={{ width: `${progressToHa}%` }}
            ></div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            {allTimeReps} / 1000 repetitions ({progressToHa.toFixed(1)}%)
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AdditionPractice() {
  return (
    <ProtectedRoute>
      <AdditionPracticeContent />
    </ProtectedRoute>
  );
}
