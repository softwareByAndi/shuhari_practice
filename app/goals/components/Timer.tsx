'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '@/lib/types/goals';

interface TimerProps {
  initialTime: number; // milliseconds
  onComplete: () => void;
  onClose: () => void;
  compact?: boolean; // Option for compact mode
}

export default function Timer({ initialTime, onComplete, onClose }: TimerProps) {
  const [phase, setPhase] = useState<'countdown' | 'timer' | 'complete'>('countdown');
  const [countdownValue, setCountdownValue] = useState(5);
  const [timerValue, setTimerValue] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for beep sound
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,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';

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase === 'countdown') {
      if (countdownValue === 0) {
        // When countdown reaches 0, switch to timer phase
        const timeout = setTimeout(() => {
          setPhase('timer');
        }, 1000);
        return () => clearTimeout(timeout);
      }

      intervalRef.current = setInterval(() => {
        setCountdownValue((prev) => prev - 1);
      }, 1000);
    } else if (phase === 'timer' && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimerValue((prev) => {
          if (prev <= 1000) {
            setPhase('complete');
            if (audioRef.current) {
              audioRef.current.play().catch(console.error);
            }
            onComplete();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, isPaused, countdownValue, onComplete]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const getProgressPercentage = () => {
    if (phase === 'countdown') {
      return ((5 - countdownValue) / 5) * 100;
    }
    return ((initialTime - timerValue) / initialTime) * 100;
  };

  const getDisplayTime = () => {
    if (phase === 'countdown') {
      return countdownValue.toString();
    }
    return formatTime(timerValue);
  };

  const getPhaseColor = () => {
    if (phase === 'complete') return 'text-green-600';
    if (phase === 'countdown') return 'text-blue-600';
    return 'text-gray-900 dark:text-white';
  };

  const getProgressBarColor = () => {
    if (phase === 'complete') return 'bg-green-500';
    if (phase === 'countdown') return 'bg-blue-500';
    return 'bg-indigo-600';
  };

  if (phase === 'complete') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Complete!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Timer finished successfully
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {phase === 'countdown' ? 'Get Ready' : 'Timer Running'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${getProgressBarColor()}`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <div className={`text-6xl font-bold ${getPhaseColor()} font-mono`}>
            {getDisplayTime()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {phase === 'countdown' ? 'Starting soon...' : 'Time remaining'}
          </p>
        </div>

        {phase === 'timer' && (
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePauseResume}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isPaused
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}