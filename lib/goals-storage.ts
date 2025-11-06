import { Goal, ActionItem, GoalSession, GoalSessionHistory } from './types/goals';

// Key formats
const LS_GOALS_KEY = 'shuhari_goals';
const LS_GOAL_SESSION_KEY = 'shuhari_goal_session';
const LS_GOAL_HISTORY_KEY = 'GoalSessionHistory';

// ===== Goals Management =====

export function getGoals(userId: string | null): Goal[] {
  if (typeof window === 'undefined') return [];

  const key = `${LS_GOALS_KEY}_${userId || 'anonymous'}`;
  const stored = localStorage.getItem(key);

  if (!stored) return [];

  try {
    const goals = JSON.parse(stored) as Goal[];
    return goals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error parsing goals from localStorage:', error);
    return [];
  }
}

export function saveGoal(goal: Goal): void {
  if (typeof window === 'undefined') return;

  const key = `${LS_GOALS_KEY}_${goal.userId || 'anonymous'}`;
  const goals = getGoals(goal.userId);

  // Check if goal exists and update, otherwise add
  const existingIndex = goals.findIndex(g => g.id === goal.id);
  if (existingIndex >= 0) {
    goals[existingIndex] = goal;
  } else {
    goals.push(goal);
  }

  localStorage.setItem(key, JSON.stringify(goals));
}

export function deleteGoal(goalId: string, userId: string | null): void {
  if (typeof window === 'undefined') return;

  const key = `${LS_GOALS_KEY}_${userId || 'anonymous'}`;
  const goals = getGoals(userId);
  const filtered = goals.filter(g => g.id !== goalId);

  localStorage.setItem(key, JSON.stringify(filtered));

  // Also delete associated session and history
  const sessionKey = `${LS_GOAL_SESSION_KEY}_${goalId}`;
  const historyKey = `${LS_GOAL_HISTORY_KEY}_${userId || 'anonymous'}_${goalId}`;
  localStorage.removeItem(sessionKey);
  localStorage.removeItem(historyKey);
}

// ===== Action Items Management =====

export function getActionItems(goalId: string, userId: string | null): ActionItem[] {
  if (typeof window === 'undefined') return [];

  const key = `shuhari_action_items_${userId || 'anonymous'}_${goalId}`;
  const stored = localStorage.getItem(key);

  if (!stored) return [];

  try {
    const items = JSON.parse(stored) as ActionItem[];
    return items.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error parsing action items from localStorage:', error);
    return [];
  }
}

export function saveActionItems(goalId: string, userId: string | null, items: ActionItem[]): void {
  if (typeof window === 'undefined') return;

  const key = `shuhari_action_items_${userId || 'anonymous'}_${goalId}`;
  localStorage.setItem(key, JSON.stringify(items));
}

// ===== Session Management =====

export function getGoalSession(goalId: string, userId: string | null): GoalSession | null {
  if (typeof window === 'undefined') return null;

  const key = `${LS_GOAL_SESSION_KEY}_${goalId}`;
  const stored = localStorage.getItem(key);

  if (!stored) return null;

  try {
    const session = JSON.parse(stored) as GoalSession;
    // Validate that session belongs to current user
    if (session.userId !== userId) {
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error parsing goal session from localStorage:', error);
    return null;
  }
}

export function saveGoalSession(session: GoalSession): void {
  if (typeof window === 'undefined') return;

  const key = `${LS_GOAL_SESSION_KEY}_${session.goalId}`;
  localStorage.setItem(key, JSON.stringify(session));
}

export function clearGoalSession(goalId: string): void {
  if (typeof window === 'undefined') return;

  const key = `${LS_GOAL_SESSION_KEY}_${goalId}`;
  localStorage.removeItem(key);
}

// ===== Session History Management =====

export function getGoalHistory(goalId: string, userId: string | null): GoalSessionHistory | null {
  if (typeof window === 'undefined') return null;

  const key = `${LS_GOAL_HISTORY_KEY}_${userId || 'anonymous'}_${goalId}`;
  const stored = localStorage.getItem(key);

  if (!stored) return null;

  try {
    return JSON.parse(stored) as GoalSessionHistory;
  } catch (error) {
    console.error('Error parsing goal history from localStorage:', error);
    return null;
  }
}

export function submitGoalSession(session: GoalSession): void {
  if (typeof window === 'undefined') return;

  // Mark session as submitted
  const submittedSession = { ...session, submitted: true };

  // Get or create history
  let history = getGoalHistory(session.goalId, session.userId);

  if (!history) {
    history = {
      goalId: session.goalId,
      userId: session.userId,
      sessions: []
    };
  }

  // Add session to history
  history.sessions.push(submittedSession);

  // Save history
  const key = `${LS_GOAL_HISTORY_KEY}_${session.userId || 'anonymous'}_${session.goalId}`;
  localStorage.setItem(key, JSON.stringify(history));

  // Clear current session
  clearGoalSession(session.goalId);
}

// ===== Utility Functions =====

export function getAllGoalHistories(userId: string | null): GoalSessionHistory[] {
  if (typeof window === 'undefined') return [];

  const prefix = `${LS_GOAL_HISTORY_KEY}_${userId || 'anonymous'}_`;
  const histories: GoalSessionHistory[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          histories.push(JSON.parse(stored) as GoalSessionHistory);
        } catch (error) {
          console.error(`Error parsing history for key ${key}:`, error);
        }
      }
    }
  }

  return histories;
}

export function clearAllGoalData(userId: string | null): void {
  if (typeof window === 'undefined') return;

  const userKey = userId || 'anonymous';
  const prefixes = [
    `${LS_GOALS_KEY}_${userKey}`,
    `shuhari_action_items_${userKey}`,
    `${LS_GOAL_HISTORY_KEY}_${userKey}`
  ];

  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && prefixes.some(prefix => key.startsWith(prefix))) {
      keysToRemove.push(key);
    }
  }

  // Also remove all active sessions
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LS_GOAL_SESSION_KEY)) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const session = JSON.parse(stored) as GoalSession;
          if (session.userId === userId) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // Skip invalid entries
        }
      }
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}