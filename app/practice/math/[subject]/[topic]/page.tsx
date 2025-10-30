'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  getUserProgress,
  createSession,
  updateSession,
  checkAndAdvanceStage,
  getTopicByCode,
  getTotalRepsForTopic,
  createOrUpdateUserProgress,
  supabase
} from '@/lib/supabase-v2';
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

// Mapping from URL equation types to topic codes
const EQUATION_TO_TOPIC: Record<string, string> = {
  'addition': 'add',
  'subtraction': 'sub',
  'multiplication': 'mul',
  'division': 'div',
  'modulus': 'mod',
  'exponents': 'exp',
  'square-roots': 'root',
  'negatives-addition': 'add_w_negatives',
  'negatives-subtraction': 'subtract_w_negatives'
};

// Calculate median of an array of numbers
function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// Calculate session statistics
function calculateSessionStats(
  responseTimes: number[],
  totalReps: number,
  incorrectCount: number
) {
  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;
  const medianResponseTime = calculateMedian(responseTimes);
  const accuracy = totalReps / (totalReps + incorrectCount) || 0;

  return {
    avgResponseTime,
    medianResponseTime,
    accuracy
  };
}

// Add filtered response time to array
function addFilteredResponseTime(
  responseTimes: number[],
  newTime: number,
  lastSessionAvg: number
): number[] {
  const newResponseTimes = [...responseTimes];

  if (responseTimes.length > 0) {
    const currentAvg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    if (newTime < currentAvg * 5) {
      newResponseTimes.push(newTime);
    }
  } else if (lastSessionAvg > 0) {
    if (newTime < lastSessionAvg * 5) {
      newResponseTimes.push(newTime);
    }
  } else {
    newResponseTimes.push(newTime);
  }

  return newResponseTimes;
}

function EquationPracticeContent() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();

  const topicCode = params.topic as string;
  // Map topic code to equation type for compatibility with equation config
  const equationType = Object.entries(EQUATION_TO_TOPIC).find(([_, code]) => code === topicCode)?.[0] || topicCode;
  const digits = parseInt(searchParams.get('digits') || '1');

  const [config, setConfig] = useState<EquationConfig | null>(null);
  const [problemSet, setProblemSet] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved'>('idle');
  const [allTimeReps, setAllTimeReps] = useState(0);

  // Session statistics combined into single state
  const [sessionStats, setSessionStats] = useState({
    reps: 0,
    responseTimes: [] as number[],
    incorrectAnswers: 0,
    lastSessionAvg: 0
  });
  const [topicId, setTopicId] = useState<number | null>(null);
  const [currentStageId, setCurrentStageId] = useState(1);
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

  // Create session on first submission
  const ensureSessionCreated = useCallback(async () => {
    if (!sessionInitialized && user?.id && topicId && currentStageId) {
      const session = await createSession(user.id, topicId, currentStageId);
      if (session) {
        setSessionId(session.id);
        setSessionInitialized(true);
        return session.id;
      }
    }
    return sessionId;
  }, [sessionInitialized, user, topicId, currentStageId, sessionId]);

  // Debounced save function
  const debouncedSave = useCallback(async (
    sessionId: number,
    totalReps: number,
    responseTimes: number[],
    incorrectCount: number
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

      // Calculate session stats
      const stats = calculateSessionStats(responseTimes, totalReps, incorrectCount);

      await updateSession(sessionId, {
        total_reps: totalReps,
        avg_response_time: stats.avgResponseTime,
        median_response_time: stats.medianResponseTime,
        accuracy: stats.accuracy
      });

      // Refresh all-time reps
      if (topicId && user?.id) {
        const updatedAllTimeReps = await getTotalRepsForTopic(user.id, topicId);
        setAllTimeReps(updatedAllTimeReps);
      }

      setSaveStatus('saved');

      // Clear saved status after 2 seconds
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
      saveStatusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 3000);
  }, [topicId, user]);

  // Load next problem
  const loadNextProblem = useCallback(async () => {
    let problems = problemSet;
    let index = currentIndex;

    // If we've reached the end of the set, shuffle and restart
    if (index >= problems.length) {
      setShowCongrats(true);
      problems = initializeProblemSet();
      index = 0;

      // Immediate save on set completion (bypass debounce) - only if session exists
      if (sessionInitialized && sessionId) {
        const totalReps = sessionStats.reps;
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        setSaveStatus('saving');

        // Calculate stats
        const stats = calculateSessionStats(sessionStats.responseTimes, totalReps, sessionStats.incorrectAnswers);

        await updateSession(sessionId, {
          total_reps: totalReps,
          avg_response_time: stats.avgResponseTime,
          median_response_time: stats.medianResponseTime,
          accuracy: stats.accuracy
        });

        // Refresh all-time reps and check for stage advancement
        if (topicId && user?.id) {
          const updatedAllTimeReps = await getTotalRepsForTopic(user.id, topicId);
          setAllTimeReps(updatedAllTimeReps);

          // Check for stage advancement
          const newStageId = await checkAndAdvanceStage(
            user.id,
            topicId,
            currentStageId,
            updatedAllTimeReps
          );

          if (newStageId > currentStageId) {
            setCurrentStageId(newStageId);
          }
        }

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
  }, [problemSet, currentIndex, initializeProblemSet, sessionId, sessionInitialized, sessionStats, topicId, user, currentStageId]);

  // Process correct answer - shared logic for both handleNumberClick and handleSubmit
  const processCorrectAnswer = useCallback(async () => {
    setFeedback('correct');

    // Track response time
    const responseTime = Date.now() - problemStartTimeRef.current;
    const newResponseTimes = addFilteredResponseTime(
      sessionStats.responseTimes,
      responseTime,
      sessionStats.lastSessionAvg
    );

    // Update session stats
    const newSessionReps = sessionStats.reps + 1;
    setSessionStats(prev => ({
      ...prev,
      reps: newSessionReps,
      responseTimes: newResponseTimes
    }));

    // Save to database if logged in
    if (user?.id) {
      const currentSessionId = await ensureSessionCreated();
      if (currentSessionId) {
        debouncedSave(currentSessionId, newSessionReps, newResponseTimes, sessionStats.incorrectAnswers);
      }
    }

    // Check for stage advancement
    if (topicId && user?.id) {
      const newTotalReps = allTimeReps + 1;
      setAllTimeReps(newTotalReps);

      const newStageId = await checkAndAdvanceStage(
        user.id,
        topicId,
        currentStageId,
        newTotalReps
      );

      if (newStageId > currentStageId) {
        setCurrentStageId(newStageId);
      }
    }

    // Remove focus from button to prevent highlight
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Load next problem after brief feedback
    setTimeout(() => {
      loadNextProblem();
    }, 200);
  }, [sessionStats, user, ensureSessionCreated, debouncedSave, topicId,
      allTimeReps, currentStageId, loadNextProblem, setSessionStats]);

  // Initialize user and load progress from database
  useEffect(() => {
    async function initializeSession() {
      if (!config) return;

      try {
        // Topic code comes directly from URL params
        if (!topicCode) {
          console.error('No topic code provided');
          setIsLoading(false);
          return;
        }

        // Load stats if user is logged in
        if (user?.id) {
          // Get topic info
          const topic = await getTopicByCode(topicCode);
          if (!topic) {
            console.error('Topic not found:', topicCode);
            setIsLoading(false);
            return;
          }
          setTopicId(topic.topic_id);

          // Get or create user progress
          let progress = await getUserProgress(user.id, topic.topic_id);
          if (!progress) {
            // Create initial progress
            await createOrUpdateUserProgress(user.id, topic.topic_id, 1);
            progress = { user_id: user.id, topic_id: topic.topic_id, stage_id: 1 };
          }
          setCurrentStageId(progress.stage_id);

          // Get total reps for this topic
          const totalReps = await getTotalRepsForTopic(user.id, topic.topic_id);
          setAllTimeReps(totalReps);

          // Get last session average response time
          const { data: lastSession } = await supabase
            .from('session')
            .select('avg_response_time')
            .eq('user_id', user.id)
            .eq('topic_id', topic.topic_id)
            .order('created_at', { ascending: false })
            .limit(1); // Get just the last session

          // Use the last session if it exists
          if (lastSession && lastSession.length > 0) {
            setSessionStats(prev => ({
              ...prev,
              lastSessionAvg: lastSession[0].avg_response_time || 0
            }));
          }

          // Don't create session here - will create on first answer submission
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
  }, [config, equationType, topicCode, user, initializeProblemSet]);

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
        await processCorrectAnswer();
      }
    }
  }, [feedback, config, answer, num1, num2, processCorrectAnswer]);

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

  // Numpad configuration based on equation type
  const numpadConfig = useMemo(() => {
    const hasNegatives = config?.id === 'negatives-addition' || config?.id === 'negatives-subtraction';
    return {
      bottomLeft: hasNegatives ? 'negative' : 'clear',
      bottomRight: hasNegatives ? 'clear' : 'backspace'
    };
  }, [config?.id]);

  // Calculate progress percentage
  const progressToHa = useMemo(
    () => Math.min((allTimeReps / 1000) * 100, 100),
    [allTimeReps]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer || !config) return;

    const userAnswer = parseInt(answer);
    const correctAnswer = config.solve(num1, num2);
    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
      await processCorrectAnswer();
    } else {
      setFeedback('incorrect');
      setSessionStats(prev => ({
        ...prev,
        incorrectAnswers: prev.incorrectAnswers + 1
      }));

      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    }
  };

  // Show error if invalid topic/equation type
  if (!isValidEquationType(equationType)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-modal-emoji mb-4">❌</div>
          <p className="text-modal-text text-zinc-600 dark:text-zinc-400 mb-4">
            Invalid topic: {topicCode}
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
            <div className="font-bold text-blue-600 dark:text-blue-400" style={{ fontSize: 'calc(1.8vw + 1.8vh)' }}>{sessionStats.reps}</div>
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
                Session reps: <span className="font-bold text-blue-600 dark:text-blue-400">{sessionStats.reps}</span>
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
              {/* Bottom left button */}
              {numpadConfig.bottomLeft === 'negative' ? (
                <button
                  type="button"
                  onClick={handleNegative}
                  disabled={feedback === 'correct'}
                  className="font-semibold radius-button bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  style={{ fontSize: 'calc(1.3vw + 1.3vh)' }}
                >
                  +/−
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
              {/* Bottom right button */}
              {numpadConfig.bottomRight === 'clear' ? (
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
                  �
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