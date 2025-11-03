'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Problem as BaseProblem } from '@/lib/problem-generator-v3';
import {
  getTopicSummary,
  updateTopicSummary,
  getLocalSession,
  saveSessionToLocalStorage,
  type ActiveSession,
  type LocalTopicSummary
} from '@/lib/local-session-storage';

import { median, standardDeviation } from 'simple-statistics';
import { ProgressBar } from '@/app/practice/components/ProgressBar';

import {
  stageLookup,
  calculateStageByReps
} from '@/lib/local_db_lookup';

import {
  Stage
} from '@/lib/types/database';


// Extended Problem type with display and answer
export interface Problem extends BaseProblem {
  display: string;
  answer: number;
}


interface SessionContextType {
  // Session data
  session: ActiveSession | null;
  isLoading: boolean;

  // Session actions
  initializeSession: (topicId: number) => Promise<void>;
  recordAnswer: (isCorrect: boolean, responseTime: number) => void;

  // Stats helpers
  getAccuracy: () => number;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

interface SessionProviderProps {
  children: React.ReactNode;
}

interface TopicProgress {
  topicId: number;
  totalReps: number;
  currentStage: Stage;
  nextStage?: Stage;
}
  
export function SessionProvider({ children }: SessionProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [topicProgress, setTopicProgress] = useState<TopicProgress | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize session
  const initializeSession = useCallback(async (
    topicId: number
  ) => {
    setIsLoading(true);
    console.log('Initializing session for topic:', topicId, 'User:', user?.id || 'anonymous');
    try {
      const userId = user?.id || null;

      let summary = getTopicSummary(topicId, userId);
      let prevSession = getLocalSession();
      if (prevSession && prevSession.topicId === topicId) {
        summary = updateTopicSummary(prevSession, true);
      }

      const totalReps = summary?.totalReps || 0;
      const currentStage = calculateStageByReps(totalReps);
      const nextStage = stageLookup.by_id[currentStage.stage_id + 1] || undefined;
      setTopicProgress({
        topicId,
        totalReps,
        currentStage,
        nextStage
      });

      // Initialize session state
      const newSession: ActiveSession = {
        localSessionKey: `local_session_${Date.now()}`,
        sessionId: null,
        topicId,
        userId,
        startTime: new Date(),
        totalProblems: 0,
        accuracy: 0,
        medianTime: 0,
        standardDeviationTime: 0,
        responseTimes: []
      };

      setSession(newSession);

    } catch (error) {
      console.error('Failed to initialize session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);



  // Record answer
  const recordAnswer = useCallback((
    isCorrect: boolean, 
    responseTime: number
  ) => {
    console.log('Recording answer. Correct:', isCorrect, 'Response time:', responseTime);
    setSession(prev => {
      if (!prev) return null;
      let numCorrect = (prev.accuracy ?? 1) * prev.totalProblems;
      if (isCorrect) {
        numCorrect++;
      }
      prev.totalProblems++;
      prev.accuracy = prev.totalProblems / numCorrect;
      
      prev.responseTimes.push(responseTime)
      prev.responseTimes.sort()

      prev.medianTime = median(prev.responseTimes);
      prev.standardDeviationTime = standardDeviation(prev.responseTimes) || 0;
      
      return {...prev};
    });
  }, []);


  // Stats helpers
  const getAccuracy = useCallback(() => {
    return session?.accuracy ?? 0;
  }, [session]);


  // Auto-save session to localStorage
  useEffect(() => {
    console.log('Session changed, scheduling save...', session);
    if (!session) {
      console.error('No active session to save.');
      return;
    }
    if (session.totalProblems === 0) {
      console.log('No problems answered yet, skipping save.');
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    console.log('Scheduling debounced save to DB... ', session);

    saveTimeoutRef.current = setTimeout(() => {
      try {
        // setSaveStatus('saving');
        saveSessionToLocalStorage(session);
        setSaveStatus('saved');
        // Reset status after 2 seconds to give time for user to notice
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to save session:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 3000); // 3 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [session]);

  const value: SessionContextType = {
    session,
    isLoading,
    initializeSession,
    recordAnswer,
    getAccuracy,
  };


  return (
    <SessionContext.Provider value={value}>

      {/* Save Status Indicator */}
      {user && saveStatus !== 'idle' && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
            saveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
            saveStatus === 'saved' ? 'bg-green-100 text-green-700' :
            'bg-red-100 text-red-700'
          }`}>
            {
              saveStatus === 'saving' ? 'Saving...' :
              saveStatus === 'saved' ? 'Saved ✓' :
              saveStatus === 'error' ? 'Save failed' :
              'Unknown status'
            }
          </div>
        </div>
      )}

      {children}

      {/* <details className="fixed bottom-2 left-2 pl-14 py-2 bg-white dark:bg-zinc-900 z-99 w-full">
        <summary className="mb-2 text-xs font-bold">
          Session Details:
        </summary>
        <div className="w-full grid grid-cols-3 gap-2">
          {Object.entries(session || {}).map(([key, value]) => (
            <div key={key} style={{ fontSize: '10px' }}>
              {typeof value === 'object' && !isNil(value) && !Array.isArray(value) ? (
                <details>
                  <summary><strong>{key}:</strong></summary>
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                </details>
              ) : (
                <span><strong>{key}:</strong> {JSON.stringify(value)}</span>
              )}
            </div>
          ))}
        </div>
      </details> */}


      {topicProgress && session && (
        <ProgressBar
          currentReps={topicProgress.totalReps + session.totalProblems}
          targetReps={topicProgress.currentStage.reps_in_stage ?? 100_000_000}
          currentStage={topicProgress.currentStage}
          nextStage={topicProgress.nextStage ?? null}
        />
      )}

    </SessionContext.Provider>
  );
}