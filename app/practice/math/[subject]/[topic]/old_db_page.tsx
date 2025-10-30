'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  createPracticeSession,
  updatePracticeSession,
  getTotalRepsForModule,
  getLastSessionAvgResponseTime,
} from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  getEquationConfig,
  isValidEquationType,
  type EquationConfig
} from '@/lib/equation-types';
import {
  generateAllProblems,
  shuffleArray,
  type Problem,
} from '@/lib/problem-generator';

function EquationPracticeContent() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();

  const equationType = params.type as string;
  const digits = parseInt(searchParams.get('digits') || '1');

  const [config, setConfig] = useState<EquationConfig | null>(null);
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

  // Container dimension constants - adjust these to change overall size
  const MAX_CONTAINER_HEIGHT = 1600; // px - maximum height of the practice container
  const CONTAINER_ASPECT_RATIO = 0.47; // width/height ratio (0.6 = 60% as wide as it is tall)

  // Validate equation type
  useEffect(() => {
    if (!isValidEquationType(equationType)) {
      return;
    }
    const equationConfig = getEquationConfig(equationType);
    setConfig(equationConfig);
  }, [equationType]);

  // Initialize or reset problem set
  const initializeProblemSet = useCallback(() => {
    if (!config) return [];

    const allProblems = generateAllProblems(digits, config);
    const shuffled = shuffleArray(allProblems);
    setProblemSet(shuffled);
    setCurrentIndex(0);
    return shuffled;
  }, [config, digits]);

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
      const updatedAllTimeReps = await getTotalRepsForModule(userId!, 'math', `equations-${equationType}-${digits}d`);
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
  }, [equationType, digits]);

  // Load next problem
  const loadNextProblem = useCallback(async () => {
    let problems = problemSet;
    let index = currentIndex;

    // If we've reached the end of the set, shuffle and restart
    if (index >= problems.length) {
      setShowCongrats(true);
      problems = initializeProblemSet();
      index = 0;

      // Immediate save on set completion (bypass debounce)
      if (sessionId && user?.id) {
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
        const updatedAllTimeReps = await getTotalRepsForModule(user?.id!, 'math', `equations-${equationType}-${digits}d`);
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
  }, [problemSet, currentIndex, initializeProblemSet, sessionId, user, sessionReps, responseTimes, equationType, digits]);

  // Initialize user and load progress from database
  useEffect(() => {
    async function initializeSession() {
      if (!config) return;

      try {
        // Load stats if user is logged in
        if (user?.id) {
          const moduleName = `equations-${equationType}-${digits}d`;
          const totalReps = await getTotalRepsForModule(user.id, 'math', moduleName);
          setAllTimeReps(totalReps);

          const lastAvg = await getLastSessionAvgResponseTime(user.id, 'math', moduleName);
          setLastSessionAvg(lastAvg);
        }

        // Initialize problem set (works for both logged in and anonymous users)
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
  }, [config, equationType, digits, user, initializeProblemSet]);

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

  const handleNumberClick = useCallback(async (num: number) => {
    // Prevent input during feedback animation
    if (feedback === 'correct' || !config) return;

    const newAnswer = answer + num.toString();
    setAnswer(newAnswer);

    // Auto-submit if answer length matches the correct answer
    const correctAnswer = config.solve(num1, num2);
    const userAnswer = parseInt(newAnswer);

    if (!isNaN(userAnswer) && newAnswer.length >= correctAnswer.toString().length) {
      if (userAnswer === correctAnswer) {
        setFeedback('correct');

        // Track response time
        const responseTime = Date.now() - problemStartTimeRef.current;

        // Calculate current average and check if this response time should be included
        let newResponseTimes = [...responseTimes];
        if (responseTimes.length > 0) {
          const currentAvg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
          if (responseTime < currentAvg * 5) {
            newResponseTimes.push(responseTime);
          }
        } else if (lastSessionAvg > 0) {
          if (responseTime < lastSessionAvg * 5) {
            newResponseTimes.push(responseTime);
          }
        } else {
          newResponseTimes.push(responseTime);
        }
        setResponseTimes(newResponseTimes);

        // Increment session reps
        const newSessionReps = sessionReps + 1;
        setSessionReps(newSessionReps);

        // Create session on first correct answer if not already created
        const handleSave = async () => {
          if (!sessionId && user?.id) {
            const moduleName = `equations-${equationType}-${digits}d`;
            const session = await createPracticeSession(user.id, 'math', moduleName);
            if (session) {
              setSessionId(session.id);
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
  }, [feedback, config, answer, num1, num2, responseTimes, lastSessionAvg, sessionReps, sessionId, user, equationType, digits, debouncedSave, loadNextProblem]);

  const handleClear = () => {
    setAnswer('');
  };

  const handleBackspace = () => {
    setAnswer(answer.slice(0, -1));
  };

  const handleNegative = () => {
    if (answer.startsWith('-')) {
      setAnswer(answer.slice(1));
    } else {
      setAnswer('-' + answer);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer || !config) return;

    const userAnswer = parseInt(answer);
    const correctAnswer = config.solve(num1, num2);
    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
      setFeedback('correct');

      // Track response time
      const responseTime = Date.now() - problemStartTimeRef.current;

      let newResponseTimes = [...responseTimes];
      if (responseTimes.length > 0) {
        const currentAvg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        if (responseTime < currentAvg * 5) {
          newResponseTimes.push(responseTime);
        }
      } else if (lastSessionAvg > 0) {
        if (responseTime < lastSessionAvg * 5) {
          newResponseTimes.push(responseTime);
        }
      } else {
        newResponseTimes.push(responseTime);
      }
      setResponseTimes(newResponseTimes);

      const newSessionReps = sessionReps + 1;
      setSessionReps(newSessionReps);

      const handleSave = async () => {
        if (!sessionId && user?.id) {
          const moduleName = `equations-${equationType}-${digits}d`;
          const session = await createPracticeSession(user.id, 'math', moduleName);
          if (session) {
            setSessionId(session.id);
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

  // Show error if invalid equation type
  if (!isValidEquationType(equationType)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-modal-emoji mb-4">❌</div>
          <p className="text-modal-text text-zinc-600 dark:text-zinc-400 mb-4">
            Invalid equation type: {equationType}
          </p>
          <Link
            href="/practice/math"
            className="text-back-link text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Math Practice
          </Link>
        </div>
      </div>
    );
  }

  const progressToHa = Math.min((allTimeReps / 1000) * 100, 100);

  if (isLoading || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-modal-emoji mb-4">📚</div>
          <p className="text-modal-text text-zinc-600 dark:text-zinc-400">Loading your practice session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-black overflow-hidden">
      {/* Anonymous User Banner */}
      {!user && (
        <div className="bg-blue-600 text-white px-4 py-2 text-center flex-shrink-0">
          <p className="text-banner">
            You're practicing anonymously. Progress won't be saved.{' '}
            <a href="/auth" className="underline font-semibold hover:text-blue-200">
              Sign in
            </a>{' '}
            to track your progress!
          </p>
        </div>
      )}

      {/* Save Status Indicator */}
      {user && saveStatus !== 'idle' && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-full spacing-save-indicator-padding shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center spacing-section-gap">
            {saveStatus === 'pending' && (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-save-status text-zinc-600 dark:text-zinc-400">Unsaved changes</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-save-status text-zinc-600 dark:text-zinc-400">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-save-status text-green-600 dark:text-green-400">Saved!</span>
              </>
            )}
          </div>
        </div>
      )}

      <main
        className="mx-auto overflow-hidden"
        style={{
          height: `min(100vh, ${MAX_CONTAINER_HEIGHT}px)`,
          width: `min(100vw, ${MAX_CONTAINER_HEIGHT * CONTAINER_ASPECT_RATIO}px)`,
          maxHeight: `${MAX_CONTAINER_HEIGHT}px`,
          maxWidth: `${MAX_CONTAINER_HEIGHT * CONTAINER_ASPECT_RATIO}px`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: '2% 4%',
        }}
      >
        {/* Header */}
        <div style={{ height: '8%', marginBottom: '1%' }}>
          <Link
            href="/practice/math"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            style={{ fontSize: 'calc(0.8vw + 0.8vh)', marginBottom: '0.5%' }}
          >
            ← Back to Math Practice
          </Link>
          <h1 className="font-bold text-zinc-900 dark:text-white" style={{ fontSize: 'calc(1.5vw + 1.5vh)' }}>
            {config.emoji} {config.title} Practice
          </h1>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2" style={{ height: '8%', gap: '4%', marginBottom: '4%' }}>
          <div className="bg-white dark:bg-zinc-800 radius-card shadow-md border border-zinc-200 dark:border-zinc-700
                          flex flex-col justify-center align-center text-center" 
          >
            <div className="text-zinc-500 dark:text-zinc-400" style={{ fontSize: 'calc(0.7vw + 0.7vh)', marginTop: '2%' }}>Session Reps</div>
            <div className="font-bold text-blue-600 dark:text-blue-400" style={{ fontSize: 'calc(1.8vw + 1.8vh)' }}>{sessionReps}</div>
          </div>
          <div className="bg-white dark:bg-zinc-800 radius-card shadow-md border border-zinc-200 dark:border-zinc-700
                          flex flex-col justify-center align-center text-center"
          >
            <p className="text-zinc-500 dark:text-zinc-400" style={{ fontSize: 'calc(0.7vw + 0.7vh)', marginTop: '2%' }}>Total Reps</p>
            <p className="font-bold text-indigo-600 dark:text-indigo-400" style={{ fontSize: 'calc(1.8vw + 1.8vh)' }}>{allTimeReps}</p>
          </div>
        </div>

        {/* Congratulations Modal */}
        {showCongrats && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-zinc-800 radius-modal spacing-modal-padding shadow-2xl border border-zinc-200 dark:border-zinc-700 max-w-md w-full text-center animate-bounce">
              <div className="text-modal-emoji mb-4">🎉</div>
              <h2 className="text-modal-title font-bold text-zinc-900 dark:text-white mb-2">
                Set Complete!
              </h2>
              <p className="text-modal-text text-zinc-600 dark:text-zinc-400 mb-4">
                You've completed all {problemSet.length} problems!
              </p>
              <p className="text-modal-small text-zinc-500 dark:text-zinc-400">
                Session reps: <span className="font-bold text-blue-600 dark:text-blue-400">{sessionReps}</span>
              </p>
              <p className="text-modal-small text-zinc-500 dark:text-zinc-400">
                Total reps: <span className="font-bold text-indigo-600 dark:text-indigo-400">{allTimeReps}</span> / 1000
              </p>
            </div>
          </div>
        )}

        {/* Problem Card */}
        <div
          className={`radius-card shadow-xl border transition-colors duration-200 flex flex-col ${
            feedback === 'correct'
              ? 'bg-green-300 dark:bg-green-600 border-green-400 dark:border-green-500'
              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
          }`}
          style={{ height: '59%', padding: '2% 6% 6%' }}
        >
          <div className="text-center flex justify-center align-center" style={{ height: '15%', marginBottom: '2%' }}>
            <div className="font-bold text-zinc-900 dark:text-white" style={{ margin: 'auto', fontSize: 'calc(2.5vw + 2.5vh)' }}>
              {config.id === 'square-roots' ? (
                <>
                  {config.operator}{num1} = ?
                </>
              ) : (
                <>
                  {num1} {config.operator} {num2} = ?
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="w-full text-center border-2 border-zinc-300 dark:border-zinc-600 radius-button bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center font-bold" style={{ height: '12%', marginBottom: '3%', fontSize: 'calc(2vw + 2vh)' }}>
              {answer || '?'}
            </div>

            {/* Custom Numpad */}
            <div className="grid grid-cols-3" style={{ flex: 1, gap: '2%' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumberClick(num)}
                  disabled={feedback === 'correct'}
                  className="font-semibold radius-button bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  style={{ fontSize: 'calc(1.8vw + 1.8vh)' }}
                >
                  {num}
                </button>
              ))}
              {config.id === 'negatives-addition' || config.id === 'negatives-subtraction' ? (
                <button
                  type="button"
                  onClick={handleNegative}
                  disabled={feedback === 'correct'}
                  className="font-semibold radius-button bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  style={{ fontSize: 'calc(1.3vw + 1.3vh)' }}
                >
                  +/−
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={feedback === 'correct'}
                  className="font-semibold radius-button bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  style={{ fontSize: 'calc(1.3vw + 1.3vh)' }}
                >
                  Clear
                </button>
              )}
              <button
                key={0}
                type="button"
                onClick={() => handleNumberClick(0)}
                disabled={feedback === 'correct'}
                className="font-semibold radius-button bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                style={{ fontSize: 'calc(1.8vw + 1.8vh)' }}
              >
                0
              </button>
              {config.id === 'negatives-addition' || config.id === 'negatives-subtraction' ? (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={feedback === 'correct'}
                  className="font-semibold radius-button bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  style={{ fontSize: 'calc(1.3vw + 1.3vh)' }}
                >
                  Clear
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBackspace}
                  disabled={feedback === 'correct'}
                  className="font-semibold radius-button bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  style={{ fontSize: 'calc(1.3vw + 1.3vh)' }}
                >
                  ←
                </button>
              )}
            </div>
          </form>

          {/* Feedback */}
          {feedback && (
            <div className={`text-center font-semibold ${
              feedback === 'correct'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`} style={{ marginTop: '2%', fontSize: 'calc(1vw + 1vh)' }}>
              {feedback === 'correct' ? '✓ Correct! Great job!' : '✗ Not quite, try again!'}
            </div>
          )}
        </div>

        {/* Shu Ha Ri Progress Indicator - Compact */}
        <div className="bg-white dark:bg-zinc-800 radius-card shadow-md border border-zinc-200 dark:border-zinc-700 flex justify-center flex-col" 
            style={{ height: '8%', padding: '1.5% 4%', marginTop: '4%' }}
          >
          <div className="flex items-center justify-between" style={{ marginBottom: '1%' }}>
            <h3 className="font-semibold text-zinc-900 dark:text-white" style={{ fontSize: 'calc(0.9vw + 0.9vh)' }}>
              守 Shu Progress
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400" style={{ fontSize: 'calc(0.7vw + 0.7vh)' }}>
              {allTimeReps} / 1000 ({progressToHa.toFixed(0)}%)
            </p>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full" style={{ height: '25%' }}>
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
              style={{ width: `${progressToHa}%`, height: '100%' }}
            ></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EquationPractice() {
  return <EquationPracticeContent />;
}
