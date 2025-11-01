'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase-v2';
import { useAuth } from '@/contexts/AuthContext';
import { Problem as BaseProblem } from '@/lib/problem-generator';

// Extended Problem type with display and answer
export interface Problem extends BaseProblem {
  display: string;
  answer: number;
}

// Types
export interface SessionStats {
  totalProblems: number;
  correctAnswers: number;
  averageTime: number;
  medianTime: number;
  responseTimes: number[];
}

export interface SessionData {
  sessionId: string | null;
  topicId: number;
  userId: string | null;
  problems: Problem[];
  currentProblemIndex: number;
  stats: SessionStats;
  startTime: Date;
  lastSaveTime: Date | null;
}

interface SessionContextType {
  // Session data
  session: SessionData | null;
  isLoading: boolean;

  // Session actions
  initializeSession: (topicId: number, problems: Problem[]) => Promise<void>;
  recordAnswer: (isCorrect: boolean, responseTime: number) => void;
  nextProblem: () => void;
  resetSession: () => void;

  // Stats helpers
  getAccuracy: () => number;
  getProgress: () => number;
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

export function SessionProvider({ children }: SessionProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize session
  const initializeSession = useCallback(async (topicId: number, problems: Problem[]) => {
    setIsLoading(true);
    console.log('Initializing session for topic:', topicId, 'User:', user?.id || 'anonymous');
    try {
      const userId = user?.id || null;

      // Initialize session state
      const newSession: SessionData = {
        sessionId: null,
        topicId,
        userId,
        problems,
        currentProblemIndex: 0,
        stats: {
          totalProblems: 0,
          correctAnswers: 0,
          averageTime: 0,
          medianTime: 0,
          responseTimes: [],
        },
        startTime: new Date(),
        lastSaveTime: null,
      };

      setSession(newSession);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // // Update session
  // const updateSession = useCallback((updates: Partial<SessionData>) => {
  //   setSession(prev => {
  //     if (!prev) return null;
  //     return { ...prev, ...updates };
  //   });
  // }, []);

  // Record answer
  const recordAnswer = useCallback((isCorrect: boolean, responseTime: number) => {
    console.log('Recording answer. Correct:', isCorrect, 'Response time:', responseTime);
    setSession(prev => {
      if (!prev) return null;

      const newStats = { ...prev.stats };
      newStats.totalProblems++;

      if (isCorrect) {
        newStats.correctAnswers++;
      }

      // Update response times (filter outliers)
      if (responseTime > 0 && responseTime < 30000) { // Less than 30 seconds
        newStats.responseTimes.push(responseTime);
        newStats.responseTimes.sort((a, b) => a - b);
        
        // Recalculate average
        newStats.averageTime = Math.round(
          newStats.responseTimes.reduce((a, b) => a + b, 0) / newStats.responseTimes.length
        );
        newStats.medianTime = newStats.responseTimes[Math.floor(newStats.responseTimes.length / 2)];
      }

      return { ...prev, stats: newStats };
    });
  }, []);



  // Move to next problem
  const nextProblem = useCallback(() => {
    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentProblemIndex: Math.min(prev.currentProblemIndex + 1, prev.problems.length - 1),
      };
    });
  }, []);

  // Reset session
  const resetSession = useCallback(() => {
    setSession(null);
    setSaveStatus('idle');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, []);



  // Stats helpers
  const getAccuracy = useCallback(() => {
    if (!session || session.stats.totalProblems === 0) return 0;
    return Math.round((session.stats.correctAnswers / session.stats.totalProblems) * 100);
  }, [session]);

  const getProgress = useCallback(() => {
    if (!session) return 0;
    return Math.round(((session.currentProblemIndex + 1) / session.problems.length) * 100);
  }, [session]);


  // Stats helpers
  const getSessionId = useCallback(() => {
    if (!session) return 'NULL';
    return session.sessionId;
  }, [session]);


  // Auto-save session to database (debounced)
  useEffect(() => {
    console.log('Session changed, scheduling auto-save... ', session);
    if (!session || !session.userId) return;
    if (session.stats.totalProblems === 0) return;

    console.log('Preparing to auto-save session:', session.sessionId);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for save
    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      console.log('Auto-saving session:', session.sessionId);
      try {
        const new_data = {
          lastSaveTime: null as Date | null,
          sessionId: session.sessionId,
        }
        const to_update = {
            total_reps: session.stats.totalProblems,
            accuracy: session.stats.correctAnswers / session.stats.totalProblems,
            average_response_time: session.stats.averageTime,
            median_response_time: session.stats.medianTime,
            updated_at: new Date().toISOString(),
        };
        if (!session.sessionId === null) {
          console.log('Creating new session record in DB');
          // Create session in database if user is logged in
          const { data, error } = await supabase
            .from('session')
            .insert({
              user_id: session.userId,
              topic_id: session.topicId,
              started_at: new Date().toISOString(),
              ...to_update
            })
            .select()
            .single();

          if (error) throw error;
          
          if (data) {
            new_data.sessionId = data.id;
            console.log('New session created with ID:', data.id);
          }
        } else {
          const { error } = await supabase
            .from('session')
            .update(to_update)
            .eq('id', session.sessionId);

          if (error) throw error;
        }

        setSaveStatus('saved');
        new_data.lastSaveTime = new Date();
        setSession(prev => prev ? { ...prev, ...new_data } : null);

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
    nextProblem,
    resetSession,
    getAccuracy,
    getProgress,
  };




  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading authentication...</div>
      </div>
    );
  }

  // Optionally handle the case when user is not signed in
  // You can show an anonymous mode or redirect to login
  // For now, we'll allow anonymous practice (userId will be null)

  return (
    <SessionContext.Provider value={value}>
            <div className="text-blue-300">hello world {getSessionId()} | {session?.userId} | {session?.topicId} </div>

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
    </SessionContext.Provider>
  );
}