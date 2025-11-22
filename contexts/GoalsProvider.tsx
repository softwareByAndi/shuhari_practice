'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Goal, ActionItem, GoalSession, GoalSessionHistory, NumericTracking, TimeTracking, EnumTracking, EnumTrackingValue } from '@/lib/types/goals';
import * as goalsStorage from '@/lib/goals-storage';
import { generateUUID } from '@/lib/uuid';

interface GoalsContextType {
  // Goals management
  goals: Goal[];
  createGoal: (title: string) => Goal;
  updateGoal: (goalId: string, title: string) => void;
  deleteGoal: (goalId: string) => void;

  // Action items management
  getActionItems: (goalId: string) => ActionItem[];
  addActionItem: (goalId: string, title: string, trackingType: 'numeric' | 'enum' | 'time', progressionRate?: number) => void;
  updateActionItem: (goalId: string, actionItemId: string, updates: Partial<ActionItem>) => void;
  removeActionItem: (goalId: string, actionItemId: string) => void;
  reorderActionItems: (goalId: string, actionItemIds: string[]) => void;

  // Session management
  activeSession: GoalSession | null;
  initializeSession: (goalId: string) => void;
  updateTracking: (actionItemId: string, value: number | EnumTrackingValue | null) => void;
  updateCompletionStatus: (actionItemId: string, completed: boolean) => void;
  submitSession: () => void;
  clearSession: () => void;

  // History
  getGoalHistory: (goalId: string) => GoalSessionHistory | null;
  getAllHistories: () => GoalSessionHistory[];

  // Loading state
  loading: boolean;
}

const GoalsContext = createContext<GoalsContextType | null>(null);

export function useGoals() {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeSession, setActiveSession] = useState<GoalSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-save debounce timer
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load goals on mount and when user changes
  useEffect(() => {
    setLoading(true);
    const loadedGoals = goalsStorage.getGoals(userId);
    setGoals(loadedGoals);

    // Check for any active session
    loadedGoals.forEach(goal => {
      const session = goalsStorage.getGoalSession(goal.id, userId);
      if (session && !session.submitted) {
        setActiveSession(session);
        return;
      }
    });

    setLoading(false);
  }, [userId]);

  // Auto-save active session with debounce
  useEffect(() => {
    if (activeSession && !activeSession.submitted) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        goalsStorage.saveGoalSession(activeSession);
      }, 3000); // 3-second debounce like SessionProvider
    }

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [activeSession]);

  // ===== Goals Management =====

  const createGoal = useCallback((title: string): Goal => {
    const newGoal: Goal = {
      id: generateUUID(),
      title,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    goalsStorage.saveGoal(newGoal);
    setGoals(prev => [newGoal, ...prev]);

    return newGoal;
  }, [userId]);

  const updateGoal = useCallback((goalId: string, title: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedGoal = {
      ...goal,
      title,
      updatedAt: new Date().toISOString()
    };

    goalsStorage.saveGoal(updatedGoal);
    setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
  }, [goals]);

  const deleteGoal = useCallback((goalId: string) => {
    goalsStorage.deleteGoal(goalId, userId);
    setGoals(prev => prev.filter(g => g.id !== goalId));

    // Clear active session if it's for this goal
    if (activeSession?.goalId === goalId) {
      setActiveSession(null);
    }
  }, [userId, activeSession]);

  // ===== Action Items Management =====

  const getActionItems = useCallback((goalId: string): ActionItem[] => {
    return goalsStorage.getActionItems(goalId, userId);
  }, [userId]);

  const addActionItem = useCallback((goalId: string, title: string, trackingType: 'numeric' | 'enum' | 'time', progressionRate?: number) => {
    const items = getActionItems(goalId);

    const newItem: ActionItem = {
      id: generateUUID(),
      goalId,
      title,
      trackingType,
      progressionRate,
      order: items.length,
      createdAt: new Date().toISOString()
    };

    goalsStorage.saveActionItems(goalId, userId, [...items, newItem]);
  }, [userId, getActionItems]);

  const updateActionItem = useCallback((goalId: string, actionItemId: string, updates: Partial<ActionItem>) => {
    const items = getActionItems(goalId);
    const updatedItems = items.map(item =>
      item.id === actionItemId ? { ...item, ...updates } : item
    );
    goalsStorage.saveActionItems(goalId, userId, updatedItems);
  }, [userId, getActionItems]);

  const removeActionItem = useCallback((goalId: string, actionItemId: string) => {
    const items = getActionItems(goalId);
    const filtered = items.filter(item => item.id !== actionItemId);

    // Reorder remaining items
    const reordered = filtered.map((item, index) => ({ ...item, order: index }));
    goalsStorage.saveActionItems(goalId, userId, reordered);

    // Remove from active session if present
    if (activeSession?.goalId === goalId) {
      setActiveSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          actionItems: prev.actionItems.filter(ai => ai.actionItemId !== actionItemId)
        };
      });
    }
  }, [userId, activeSession, getActionItems]);

  const reorderActionItems = useCallback((goalId: string, actionItemIds: string[]) => {
    const items = getActionItems(goalId);
    const reordered = actionItemIds.map((id, index) => {
      const item = items.find(i => i.id === id);
      if (!item) throw new Error(`Action item ${id} not found`);
      return { ...item, order: index };
    });
    goalsStorage.saveActionItems(goalId, userId, reordered);
  }, [userId, getActionItems]);

  // ===== Session Management =====

  const initializeSession = useCallback((goalId: string) => {
    // Check for existing session
    const existingSession = goalsStorage.getGoalSession(goalId, userId);
    if (existingSession && !existingSession.submitted) {
      setActiveSession(existingSession);
      return;
    }

    // Get last session values and action items
    const actionItems = getActionItems(goalId);
    const lastValues = goalsStorage.getLastSessionValues(goalId, userId);

    // Create new session
    const newSession: GoalSession = {
      goalId,
      userId,
      actionItems: actionItems.map(item => {
        const lastTracking = lastValues.get(item.id);
        let tracking;

        if (item.trackingType === 'numeric') {
          let initialValue = 0;
          if (lastTracking && 'value' in lastTracking && lastTracking.completed) {
            // Add progression rate to last value
            initialValue = (lastTracking.value || 0) + (item.progressionRate || 1);
          }
          tracking = {
            value: initialValue,
            completed: false,
            date: new Date().toISOString()
          } as NumericTracking;
        } else if (item.trackingType === 'time') {
          let initialValue = 0;
          if (lastTracking && 'value' in lastTracking && lastTracking.completed) {
            // Add progression rate (in minutes, convert to milliseconds)
            const progressionMs = (item.progressionRate || 1) * 60 * 1000;
            initialValue = Math.max(0, (lastTracking.value || 0) + progressionMs);
          }
          tracking = {
            value: initialValue,
            completed: false,
            date: new Date().toISOString()
          } as TimeTracking;
        } else {
          // enum type
          tracking = {
            value: 'too_lazy',
            completed: false,
            date: new Date().toISOString()
          } as EnumTracking;
        }

        return {
          actionItemId: item.id,
          tracking
        };
      }),
      sessionDate: new Date().toISOString(),
      submitted: false
    };

    setActiveSession(newSession);
    goalsStorage.saveGoalSession(newSession);
  }, [userId, getActionItems]);

  const updateTracking = useCallback((actionItemId: string, value: number | EnumTrackingValue | null) => {
    if (!activeSession) return;

    setActiveSession(prev => {
      if (!prev) return null;

      const updatedItems = prev.actionItems.map(item => {
        if (item.actionItemId !== actionItemId) return item;

        const existingTracking = item.tracking;
        let tracking;

        // Preserve the completed status
        const completed = 'completed' in existingTracking ? existingTracking.completed : false;

        if (typeof value === 'number' || value === null) {
          tracking = {
            value,
            completed,
            date: new Date().toISOString()
          } as NumericTracking | TimeTracking;
        } else {
          tracking = {
            value,
            completed,
            date: new Date().toISOString()
          } as EnumTracking;
        }

        return { ...item, tracking };
      });

      return { ...prev, actionItems: updatedItems };
    });
  }, [activeSession]);

  const updateCompletionStatus = useCallback((actionItemId: string, completed: boolean) => {
    if (!activeSession) return;

    setActiveSession(prev => {
      if (!prev) return null;

      const updatedItems = prev.actionItems.map(item => {
        if (item.actionItemId !== actionItemId) return item;

        const tracking = {
          ...item.tracking,
          completed
          // Preserve the value regardless of completion status
        };

        return { ...item, tracking };
      });

      return { ...prev, actionItems: updatedItems };
    });
  }, [activeSession]);

  const submitSession = useCallback(() => {
    if (!activeSession) return;

    goalsStorage.submitGoalSession(activeSession);
    setActiveSession(null);
  }, [activeSession]);

  const clearSession = useCallback(() => {
    if (activeSession) {
      goalsStorage.clearGoalSession(activeSession.goalId);
      setActiveSession(null);
    }
  }, [activeSession]);

  // ===== History =====

  const getGoalHistory = useCallback((goalId: string): GoalSessionHistory | null => {
    return goalsStorage.getGoalHistory(goalId, userId);
  }, [userId]);

  const getAllHistories = useCallback((): GoalSessionHistory[] => {
    return goalsStorage.getAllGoalHistories(userId);
  }, [userId]);

  const value: GoalsContextType = {
    goals,
    createGoal,
    updateGoal,
    deleteGoal,
    getActionItems,
    addActionItem,
    updateActionItem,
    removeActionItem,
    reorderActionItems,
    activeSession,
    initializeSession,
    updateTracking,
    updateCompletionStatus,
    submitSession,
    clearSession,
    getGoalHistory,
    getAllHistories,
    loading
  };

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}