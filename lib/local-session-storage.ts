import { SessionData, Problem } from '@/contexts/SessionProvider';
import { TopicWithProgress } from '@/lib/types/database';

// Local storage keys
const SESSIONS_KEY = 'shuhari_sessions';
const RECENT_TOPICS_KEY = 'shuhari_recent_topics';
const DEBUG_LOG = (msg: string) => {
  console.log('[local-session-storage]', msg);
}

export interface LocalSession {
  localSessionKey: string;
  sessionId: string | null;
  topicId: number;
  userId: string | null;
  topicCode: string;
  topicDisplayName: string;
  subjectCode: string;
  fieldCode: string;
  stats: {
    totalProblems: number;
    correctAnswers: number;
    averageTime: number;
    medianTime: number;
    responseTimes: number[];
  };
  startTime: Date;
  endTime?: Date;
  stageId?: number;
}

export interface LocalRecentTopic {
  topicId: number;
  topicCode: string;
  displayName: string;
  subjectCode: string;
  fieldCode: string;
  totalReps: number;
  sessionsCount: number;
  lastPracticed: Date;
  stageId: number;
  accuracy?: number;
  avgResponseTime?: number;
}

// Save a session to localStorage
export function saveSessionToLocalStorage(
  localSessionKey: string,
  session: SessionData,
  topicCode: string,
  topicDisplayName: string,
  subjectCode: string,
  fieldCode: string
): void {
  try {
    DEBUG_LOG(`saveSessionToLocalStorage: topicCode=${topicCode}, topicDisplayName=${topicDisplayName}`);
    // Get existing sessions
    const existingSessions = getLocalSessions();

    // Create local session object
    const localSession: LocalSession = {
      localSessionKey,
      sessionId: session.sessionId ?? null,
      topicId: session.topicId,
      userId: session.userId,
      topicCode,
      topicDisplayName,
      subjectCode,
      fieldCode,
      stats: session.stats,
      startTime: session.startTime,
      endTime: new Date(),
      stageId: 1 // Default to stage 1, can be updated
    };

    // Add or update session
    const sessionIndex = existingSessions.findIndex(
      s => s.localSessionKey === localSession.localSessionKey
    );

    if (sessionIndex >= 0) {
      existingSessions[sessionIndex] = localSession;
    } else {
      existingSessions.push(localSession);
    }

    // Keep only last 50 sessions to avoid localStorage limits
    const recentSessions = existingSessions.slice(-50);

    localStorage.setItem(SESSIONS_KEY, JSON.stringify(recentSessions));

    // Update recent topics
    updateRecentTopics(localSession);
  } catch (error) {
    console.error('Error saving session to localStorage:', error);
  }
}

// Update recent topics based on session data
function updateRecentTopics(session: LocalSession): void {
  try {
    DEBUG_LOG(`updateRecentTopics: topicId=${session.topicId}, topicCode=${session.topicCode}`);
    const recentTopics = getLocalRecentTopics();

    // Find existing topic or create new one
    const existingTopicIndex = recentTopics.findIndex(
      t => t.topicId === session.topicId
    );

    if (existingTopicIndex >= 0) {
      // Update existing topic
      const topic = recentTopics[existingTopicIndex];
      topic.totalReps += session.stats.totalProblems;
      topic.sessionsCount += 1;
      topic.lastPracticed = session.endTime || session.startTime;

      // Update accuracy (weighted average)
      const sessionAccuracy = session.stats.totalProblems > 0
        ? session.stats.correctAnswers / session.stats.totalProblems
        : 0;

      if (topic.accuracy !== undefined) {
        // Weighted average based on problems count
        const totalProblems = topic.totalReps;
        const prevWeight = (totalProblems - session.stats.totalProblems) / totalProblems;
        const newWeight = session.stats.totalProblems / totalProblems;
        topic.accuracy = (topic.accuracy * prevWeight) + (sessionAccuracy * newWeight);
      } else {
        topic.accuracy = sessionAccuracy;
      }

      // Update average response time (simple average)
      if (session.stats.averageTime > 0) {
        if (topic.avgResponseTime !== undefined && topic.avgResponseTime > 0) {
          topic.avgResponseTime = (topic.avgResponseTime + session.stats.averageTime) / 2;
        } else {
          topic.avgResponseTime = session.stats.averageTime;
        }
      }

      // Move to front (most recent)
      recentTopics.splice(existingTopicIndex, 1);
      recentTopics.unshift(topic);
    } else {
      // Create new topic entry
      const newTopic: LocalRecentTopic = {
        topicId: session.topicId,
        topicCode: session.topicCode,
        displayName: session.topicDisplayName,
        subjectCode: session.subjectCode,
        fieldCode: session.fieldCode,
        totalReps: session.stats.totalProblems,
        sessionsCount: 1,
        lastPracticed: session.endTime || session.startTime,
        stageId: session.stageId || 1,
        accuracy: session.stats.totalProblems > 0
          ? session.stats.correctAnswers / session.stats.totalProblems
          : 0,
        avgResponseTime: session.stats.averageTime
      };

      recentTopics.unshift(newTopic);
    }

    // Keep only last 10 topics
    const topTopics = recentTopics.slice(0, 10);

    localStorage.setItem(RECENT_TOPICS_KEY, JSON.stringify(topTopics));
  } catch (error) {
    console.error('Error updating recent topics:', error);
  }
}

// Get all sessions from localStorage
export function getLocalSessions(): LocalSession[] {
  try {
    DEBUG_LOG('getLocalSessions');
    const sessionsJson = localStorage.getItem(SESSIONS_KEY);
    if (!sessionsJson) return [];

    const sessions = JSON.parse(sessionsJson);
    // Convert date strings back to Date objects
    return sessions.map((s: any) => ({
      ...s,
      startTime: new Date(s.startTime),
      endTime: s.endTime ? new Date(s.endTime) : undefined
    }));
  } catch (error) {
    console.error('Error getting sessions from localStorage:', error);
    return [];
  }
}

// Get recent topics from localStorage
export function getLocalRecentTopics(): LocalRecentTopic[] {
  try {
    DEBUG_LOG('getLocalRecentTopics');
    const topicsJson = localStorage.getItem(RECENT_TOPICS_KEY);
    if (!topicsJson) return [];

    const topics = JSON.parse(topicsJson);
    // Convert date strings back to Date objects
    return topics.map((t: any) => ({
      ...t,
      lastPracticed: new Date(t.lastPracticed)
    }));
  } catch (error) {
    console.error('Error getting recent topics from localStorage:', error);
    return [];
  }
}

// Get sessions for a specific topic
export function getSessionsForTopic(topicId: number): LocalSession[] {
  DEBUG_LOG(`getSessionsForTopic: topicId=${topicId}`);
  const sessions = getLocalSessions();
  return sessions.filter(s => s.topicId === topicId);
}

// Clear all local session data
export function clearLocalSessions(): void {
  DEBUG_LOG('clearLocalSessions');
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(RECENT_TOPICS_KEY);
}

// Get topic progress from local storage (for calculating stage progression)
export function getLocalTopicProgress(topicId: number): {
  totalReps: number;
  currentStage: number;
  accuracy: number;
  avgResponseTime: number;
} {
  DEBUG_LOG(`getLocalTopicProgress: topicId=${topicId}`);
  const recentTopics = getLocalRecentTopics();
  const topic = recentTopics.find(t => t.topicId === topicId);

  if (!topic) {
    return {
      totalReps: 0,
      currentStage: 1,
      accuracy: 0,
      avgResponseTime: 0
    };
  }

  // Calculate stage based on total reps
  let currentStage = 1;
  const stageThresholds = [0, 100, 300, 600, 1000, 1500, 2000]; // Example thresholds

  for (let i = stageThresholds.length - 1; i >= 0; i--) {
    if (topic.totalReps >= stageThresholds[i]) {
      currentStage = Math.min(i + 1, 7); // Max stage is 7
      break;
    }
  }

  return {
    totalReps: topic.totalReps,
    currentStage,
    accuracy: topic.accuracy || 0,
    avgResponseTime: topic.avgResponseTime || 0
  };
}