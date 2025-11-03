
// Local storage keys
const LS_SESSION_KEY = 'shuhari_session';
const LS_TOPIC_SUMMARY_KEY = 'shuhari_topic_summary';
const DEBUG_LOG = (msg: string) => {
  console.log('[local-session-storage]', msg);
}

export interface LocalSession {
  localSessionKey: string;
  sessionId: string | null;
  topicId: number;
  userId: string | null;
  startTime: Date;
  stageId?: number;
  totalProblems: number;
  accuracy?: number;
  medianTime?: number;
  standardDeviationTime?: number
}

// Intended to make statistics calculations easier during an active session, but don't need them in localStorage
export interface ActiveSession extends LocalSession {
  responseTimes: number[];
}

// Complete topic summary including current progress and stage
export interface LocalTopicSummary {
  topicId: number;
  totalReps: number;
  sessionsCount: number;
  sessionStartDate: string;
  mostRecentSessionDate?: string;
  userId?: string;
  accuracy?: number;
  medianResponseTime?: number;
  standardDeviationTime?: number;
}


// Get the most recent session from localStorage
export function getLocalSession(): LocalSession | null {
  // FIXME - old code - to be used as reference 
  try {
    DEBUG_LOG('getLocalSession');
    const sessionJson = localStorage.getItem(LS_SESSION_KEY);
    if (!sessionJson) return null;

    const session = JSON.parse(sessionJson);
    session.startTime = new Date(session.startTime);
    return session
    
  } catch (error) {
    console.error('Error getting session from localStorage:', error);
    return null;
  }
}


/*
Save a session to localStorage
If another session is already stored, update the topic summary accordingly
*/
export function saveSessionToLocalStorage(session: ActiveSession): void {
  try {
    DEBUG_LOG(`saveSessionToLocalStorage: topicId=${session.topicId}`);

    const existingSession = getLocalSession();

    if (!!existingSession && existingSession.localSessionKey !== session.localSessionKey) {
      console.log(
        'New session detected, updating topic summary. prevSessionKey=', 
        existingSession.localSessionKey, 
        'newSessionKey=', 
        session.localSessionKey
      );      
      updateTopicSummary(existingSession, false);
    }

    localStorage.setItem(LS_SESSION_KEY, JSON.stringify(session as LocalSession));

  } catch (error) {
    console.error('Error saving session to localStorage:', error);
  }
}


// Get TopicSummary from localStorage
export function getTopicSummary(
  topicId: number,
  userId: string | null
): LocalTopicSummary | null {
  try {

    const key = `${LS_TOPIC_SUMMARY_KEY}_${userId || 'anonymous'}_${topicId}`;
    DEBUG_LOG(`getTopicSummary: key=${key}`);

    const summaryJson = localStorage.getItem(key);
    if (!summaryJson) return null;

    return JSON.parse(summaryJson);

  } catch (error) {
    console.error('Error getting topic summary from localStorage:', error);
    return null;
  }
}


// Save TopicSummary from localStorage
export function saveTopicSummary (
  topicSummary: LocalTopicSummary
): void {
  const key = `${LS_TOPIC_SUMMARY_KEY}_${topicSummary.userId || 'anonymous'}_${topicSummary.topicId}`;
  DEBUG_LOG(`saveTopicSummary: key=${key}`);
  localStorage.setItem(key, JSON.stringify(topicSummary));
}


// Optimized function to update only the changing fields
export function updateTopicSummary(
  session: LocalSession,
  clearSession: boolean = true
): LocalTopicSummary | null {

  const topicSummary = getTopicSummary(session.topicId, session.userId);

  const updatedSummary: LocalTopicSummary = {
    topicId: session.topicId,
    userId: session.userId || topicSummary?.userId,
    totalReps: (topicSummary?.totalReps || 0) + session.totalProblems,
    sessionsCount: (topicSummary?.sessionsCount || 0) + 1,
    sessionStartDate: topicSummary?.sessionStartDate || session.startTime.toISOString(),
    mostRecentSessionDate: session.startTime.toISOString(),
    accuracy: session.accuracy,
    medianResponseTime: session.medianTime,
    standardDeviationTime: session.standardDeviationTime
  };

  saveTopicSummary(updatedSummary);
  
  if (clearSession) {
    localStorage.removeItem(LS_SESSION_KEY);
  }
  return updatedSummary;
}


export function getItemsFromLocalStorageWithPrefix(prefix: string): string[] {
    return (
      Object.keys(localStorage || {})
        .filter(key => key.startsWith(prefix))
        .map(key => localStorage.getItem(key) || null)
        .filter(item => item !== null)
    ) as string[];
}


export function getAllTopicSummariesForUser(userId: string | null): LocalTopicSummary[] {
    const prefix = `${LS_TOPIC_SUMMARY_KEY}_${userId || 'anonymous'}_`;
    const topicJsonArray = getItemsFromLocalStorageWithPrefix(prefix)

    const summaries: LocalTopicSummary[] = [];
    
    for (const itemJson in topicJsonArray) {
        if (itemJson) {
            try {
                const summary: LocalTopicSummary = JSON.parse(itemJson);
                summaries.push(summary);
            } catch (error) {
                console.error('Error parsing topic summary from localStorage:', error);
            }
        }
    }
    
    return summaries;
}
