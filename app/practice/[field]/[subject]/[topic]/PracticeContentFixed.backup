'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  getEquationConfig,
  isValidEquationType,
} from '@/lib/equation-types';
import {
  generateAllProblems,
  shuffleArray,
  Problem as BaseProblem,
} from '@/lib/problem-generator';
import { getTopicByCode } from '@/lib/supabase-v2';
import { useSession, Problem } from '@/contexts/SessionProvider';

// Import our modular components
import { SimpleProgressBar } from '@/app/practice/components/SimpleProgressBar';
import { SimpleNumpad } from '@/app/practice/components/SimpleNumpad';
import { AnonymousBanner } from '@/components/AnonymousBanner';

export default function PracticeContentFixed() {
  const { user } = useAuth();
  const params = useParams();
  const {
    session,
    isLoading,
    initializeSession,
    recordAnswer,
    nextProblem,
    getAccuracy,
  } = useSession();

  const fieldCode = params.field as string;
  const subject = params.subject as string;
  const topicCode = params.topic as string;

  // State
  const [topicInfo, setTopicInfo] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [problemStartTime, setProblemStartTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper function to convert BaseProblem to Problem with display and answer
  const convertToFullProblem = (baseProblem: BaseProblem, config: any): Problem => {
    const { num1, num2 } = baseProblem;

    // Use config's displayEquation if available
    const display = config.displayEquation
      ? config.displayEquation(num1, num2)
      : `${num1} ? ${num2}`;

    // Use config's solve if available
    const answer = config.solve
      ? config.solve(num1, num2)
      : 0;

    return { num1, num2, display, answer };
  };

  // Initialize session and load topic
  useEffect(() => {
    const loadTopicAndSession = async () => {
      try {
        // Load topic info
        const topic = await getTopicByCode(topicCode);
        if (topic) {
          setTopicInfo(topic);

          // Generate problems based on equation type or topic
          let problems: Problem[] = [];

          if (topicCode && isValidEquationType(topicCode)) {
            const config = getEquationConfig(topicCode);
            if (config) {
              const baseProblems = generateAllProblems(1, config); // assuming single digit for now
              problems = shuffleArray(baseProblems).map(p => convertToFullProblem(p, config));
            }
          }

          // If no problems generated yet, use default addition
          if (problems.length === 0) {
            const addConfig = getEquationConfig('add');
            if (addConfig) {
              const baseProblems = generateAllProblems(1, addConfig);
              problems = shuffleArray(baseProblems).map(p => {
                const { num1, num2 } = p;
                return {
                  num1,
                  num2,
                  display: addConfig.displayEquation ? addConfig.displayEquation(num1, num2) : `${num1} + ${num2}`,
                  answer: addConfig.solve(num1, num2)
                };
              });
            }
          }

          // Initialize session with problems
          await initializeSession(topic.topic_id, problems);
        }
      } catch (error) {
        console.error('Error loading topic or session:', error);
      }
    };

    loadTopicAndSession();
  }, [topicCode]); //[topicCode, initializeSession]);

  // Reset problem start time when moving to next problem
  useEffect(() => {
    setProblemStartTime(Date.now());
  }, [session?.currentProblemIndex]);

  // Auto-focus input
  useEffect(() => {
    if (!isSubmitting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSubmitting, session?.currentProblemIndex]);

  const handleSubmit = async () => {
    if (!session || isSubmitting || !answer.trim()) {
      // console.log('ignoring submit');
      return;
    }

    // console.log('submitting answer:', answer);

    setIsSubmitting(true);
    const currentProblem = session.problems[session.currentProblemIndex];
    const userAnswer = parseInt(answer);
    const isCorrect = userAnswer === currentProblem.answer;
    const responseTime = Date.now() - problemStartTime;

    // Record answer in session
    recordAnswer(isCorrect, responseTime);

    // Show feedback
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    // Clear and move to next problem
    setTimeout(() => {
      setAnswer('');
      setFeedback(null);
      setIsSubmitting(false);

      if (session.currentProblemIndex < session.problems.length - 1) {
        nextProblem();
      } else {
        // Session complete
        setShowStats(true);
      }
    }, 800);
  };

  const handleNumpadInput = (value: string) => {
    if (value === 'clear') {
      setAnswer('');
    } else if (value === 'submit') {
      handleSubmit();
    } else if (answer.length < 4) {
      setAnswer(prev => prev + value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Loading state
  if (isLoading || !session || !topicInfo) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl">Loading practice session...</div>
      </div>
    );
  }

  const currentProblem = session.problems[session.currentProblemIndex];
  const progress = ((session.currentProblemIndex + 1) / session.problems.length) * 100;

  // Completed state
  if (showStats) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <h2 className="text-3xl font-bold text-center mb-6 text-green-600">
            🎉 Set Complete!
          </h2>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600">Problems Solved</p>
              <p className="text-3xl font-bold">{session.stats.totalProblems}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-green-600">{getAccuracy()}%</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(session.stats.averageTime / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Median Time</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(session.stats.medianTime / 1000).toFixed(1)}s
                </p>
              </div>
            </div>
            <div className="pt-4 space-y-2">
              <Link
                href={`/practice/${fieldCode}/${subject}/${topicCode}`}
                className="block w-full bg-blue-600 text-white py-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition-colors"
              >
                Practice Again
              </Link>
              <Link
                href={`/practice/${fieldCode}`}
                className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg text-center font-semibold hover:bg-gray-300 transition-colors"
              >
                Back to Topics
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-black overflow-hidden">

      {/* Main Practice Area */}
      <div className="flex-1 flex flex-col p-4 max-w-6xl mx-auto w-full">
        {/* Progress Section */}
        <div className="mb-6">
          <SimpleProgressBar progress={progress} />
        </div>

        {/* Simple Stats Display */}
        <div className="grid grid-cols-4 gap-2 mb-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-2 text-center">
            <div className="text-xs text-gray-600">Total</div>
            <div className="text-lg font-bold">{session.stats.totalProblems}</div>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <div className="text-xs text-gray-600">Correct</div>
            <div className="text-lg font-bold text-green-600">{session.stats.correctAnswers}</div>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <div className="text-xs text-gray-600">Accuracy</div>
            <div className="text-lg font-bold">{getAccuracy()}%</div>
          </div>
        </div>

        {/* Problem Display */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 transform transition-all duration-300">
            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-4 text-gray-700">
              {topicInfo.display_name}
            </h1>

            {/* Problem */}
            <div className="text-7xl font-bold text-center text-gray-800 mb-8 tracking-wider">
              {currentProblem.display}
            </div>

            {/* Answer Input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={answer}
                onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                disabled={isSubmitting}
                className={`w-full text-5xl font-bold text-center p-4 border-4 rounded-xl transition-all duration-300 ${
                  feedback === 'correct'
                    ? 'border-green-500 bg-green-50'
                    : feedback === 'incorrect'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 focus:border-blue-500 focus:outline-none'
                }`}
                placeholder="?"
              />
            </div>
          </div>
        </div>

        {/* Numpad */}
        <div className="mt-6">
          <SimpleNumpad onInput={handleNumpadInput} disabled={isSubmitting} />
        </div>
      </div>
    </div>
  );
}