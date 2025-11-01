'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase-v2';
import { useAuth } from '@/contexts/AuthContext';
import { Problem as BaseProblem } from '@/lib/problem-generator';
import { saveSessionToLocalStorage } from '@/lib/local-session-storage';
import { USE_LOCAL_AUTH } from '@/lib/config';
import { isNil } from 'lodash';
import { ProgressBar } from '@/app/practice/components/ProgressBar';

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
  localSessionKey: string;
  sessionId: string | null;
  topicId: number;
  userId: string | null;
  stats: SessionStats;
  startTime: Date;
  lastSaveTime: Date | null;
  // Additional metadata for localStorage
  topicCode?: string;
  topicDisplayName?: string;
  subjectCode?: string;
  fieldCode?: string;
}

interface SessionContextType {
  // Session data
  session: SessionData | null;
  isLoading: boolean;

  // Session actions
  initializeSession: (
    topicId: number,
    metadata?: {
      topicCode: string;
      topicDisplayName: string;
      subjectCode: string;
      fieldCode: string;
    }
  ) => Promise<void>;
  recordAnswer: (isCorrect: boolean, responseTime: number) => void;
  resetSession: () => void;

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

interface TopicSummaryStage {
  stage_id: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  code: 'hatsu' | 'shu' | 'kan' | 'ha' | 'toi' | 'ri' | 'ku',
  symbol: string,
  display_name: string,
  reps_in_stage: number
}
interface TopicSummary {
    topic: {
      topic_id: number;
      code: string;
      display_name: string;
    };
    subject: {
      subject_id: number;
      code: string;
      display_name: string;
    };
    field: {
      field_id: number;
      code: string;
      display_name: string;
    };
    stats: {
      totalReps: number;
      sessionsCount: number;
      lastPracticed: string;
    }
    currentStage: TopicSummaryStage;
    nextStage:    TopicSummaryStage | null;
    targetStage:  TopicSummaryStage | null;
  }
  
export function SessionProvider({ children }: SessionProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [topicSummary, setTopicSummary] = useState<TopicSummary>({
    // placeholder values
    topic: {
      topic_id: 0,
      code: 'placeholder',
      display_name: 'Placeholder Topic'
    },
    subject: {
      subject_id: 0,
      code: 'placeholder',
      display_name: 'Placeholder Subject'
    },
    field: {
      field_id: 0,
      code: 'placeholder',
      display_name: 'Placeholder Field' 
    },
    stats: {
      totalReps: 0,
      sessionsCount: 0,
      lastPracticed: new Date().toISOString(),
    },
    currentStage: {
      stage_id: 1,
      code: 'hatsu',
      symbol: '初',
      display_name: '初 - Hatsu (Begin)',
      reps_in_stage: 1000
    },
    nextStage: {
      stage_id: 2,
      code: 'shu',
      symbol: '守',
      display_name: '守 - Shu (Follow)',
      reps_in_stage: 5000
    },
    targetStage: {
      stage_id: 4,
      code: 'ha',
      symbol: '破',
      display_name: '破 - Ha (Break)',
      reps_in_stage: 50000
    }
  });

  /*
  TODO : 
  - store a topic summary for the user in localStorage
    - unique by topicId + userId
  - pull user topic summary from localStorage.
  - populate progress bar (at the bottom of this page)
  - on update session, also update topic summary
  */

  // Initialize session
  const initializeSession = useCallback(async (
    topicId: number,
    metadata?: {
      topicCode: string;
      topicDisplayName: string;
      subjectCode: string;
      fieldCode: string;
    }
  ) => {
    setIsLoading(true);
    console.log('Initializing session for topic:', topicId, 'User:', user?.id || 'anonymous');
    try {
      const userId = user?.id || null;

      // Initialize session state
      const newSession: SessionData = {
        localSessionKey: `local_${Date.now()}`,
        sessionId: null,
        topicId,
        userId,
        stats: {
          totalProblems: 0,
          correctAnswers: 0,
          averageTime: 0,
          medianTime: 0,
          responseTimes: [],
        },
        startTime: new Date(),
        lastSaveTime: null,
        // Add metadata for localStorage
        topicCode: metadata?.topicCode,
        topicDisplayName: metadata?.topicDisplayName,
        subjectCode: metadata?.subjectCode,
        fieldCode: metadata?.fieldCode,
      };

      setSession(newSession);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // // Update session ( Not Used Anywhere )
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


  // Stats helpers
  const getSessionId = useCallback(() => {
    if (!session) return 'NULL';
    return session.sessionId ?? session.localSessionKey;
  }, [session]);


  // Auto-save session to localStorage (and optionally to database)
  useEffect(() => {
    if (!session) return;
    if (session.stats.totalProblems === 0) return;

    console.log('Preparing to auto-save session');

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Always save to localStorage
    if (session.topicCode && session.topicDisplayName && session.subjectCode && session.fieldCode) {
      session.lastSaveTime = new Date();
      saveSessionToLocalStorage(
        session.localSessionKey,
        session,
        session.topicCode,
        session.topicDisplayName,
        session.subjectCode,
        session.fieldCode
      );
      console.log('Session saved to localStorage');
    }
    else {
      console.warn('Missing metadata for localStorage save:', {
        topicCode: session.topicCode,
        topicDisplayName: session.topicDisplayName,
        subjectCode: session.subjectCode,
        fieldCode: session.fieldCode
      });
    }

    // Set new timeout for save
    if (USE_LOCAL_AUTH || !session.userId) {
      return; // Skip DB save if using local auth or user is anonymous
    }
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    console.log('Scheduling debounced save to DB... ', session);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      console.log('Auto-saving session');
      if (!session.userId) {
        setSaveStatus('idle');
        console.error('User not logged in, cannot save session to database');
        return; // Do not save to DB if user is not logged in
      }
      // Save to database if user is logged in
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

        if (!session.sessionId) {
          /*create new session*/
          console.log('Creating new session record in DB');
          // Create session in database if user is logged in
          const { data, error } = await supabase!
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
          /*update existing session*/
          const { error } = await supabase!
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
    resetSession,
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


      <ProgressBar
        currentReps={topicSummary.stats.totalReps}
        targetReps={topicSummary.currentStage.reps_in_stage ?? 100_000_000}
        currentStage={topicSummary.currentStage}
        nextStage={topicSummary.nextStage ?? null}
      />

    </SessionContext.Provider>
  );
}