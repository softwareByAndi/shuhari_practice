import { createClient } from '@supabase/supabase-js';
import type {
  Field, Subject, Topic, Stage, DifficultyLevel, DifficultyProgression,
  UserProgress, Session, TopicWithProgress, SessionWithDetails,
  StageCode
} from './types/database';
import * as localDataProvider from './local-data-provider';
import { USE_LOCAL_STATIC_DATA } from './config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEBUG_LOG = (msg: string) => {
  console.log('[supabase-v2]', msg);
};

// ============= User Management (kept from original) =============

export async function getOrCreateUser(username: string) {
  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // Create new user
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ username })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return newUser;
}

// ============= Field & Subject Navigation =============

export async function getAllFields(): Promise<Field[]> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getAllFields from cached local data provider');
    return localDataProvider.getAllFields();
  }

  const { data, error } = await supabase
    .from('field')
    .select('*')
    .order('field_id');

  if (error) {
    console.error('Error fetching fields:', error);
    return [];
  }

  return data || [];
}

export async function getFieldByCode(code: string): Promise<Field | null> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getFieldByCode from cached local data provider');
    return localDataProvider.getFieldByCode(code);
  }

  const { data, error } = await supabase
    .from('field')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    console.error(`Error fetching field with code ${code}:`, error);
    return null;
  }

  return data;
}

export async function getActiveFields(): Promise<Field[]> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getActiveFields from cached local data provider');
    return localDataProvider.getActiveFields();
  }

  const { data, error } = await supabase
    .from('field')
    .select('*')
    .eq('is_active', true)
    .order('field_id');

  if (error) {
    console.error('Error fetching fields:', error);
    return [];
  }

  return data || [];
}

export async function getSubjectByCode(code: string): Promise<Subject | null> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getSubjectByCode from cached local data provider');
    return localDataProvider.getSubjectByCode(code);
  }

  const { data, error } = await supabase
    .from('subject')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    console.error(`Error fetching subject with code ${code}:`, error);
    return null;
  }

  return data;
}

export async function getSubjectsForFieldCode(fieldCode: string): Promise<Subject[]> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getSubjectsForFieldCode from cached local data provider');
    return localDataProvider.getSubjectsForFieldCode(fieldCode);
  }

  const { data, error } = await supabase
    .from('subject')
    .select(`
      *,
      field!inner(code)
    `)
    .eq('field.code', fieldCode)
    .order('subject_id');

  if (error) {
    console.error('Error fetching subjects for field code:', error);
    return [];
  }

  return data || [];
}

export async function getSubjectsForField(fieldId: number): Promise<Subject[]> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getSubjectsForField from cached local data provider');
    return localDataProvider.getSubjectsForField(fieldId);
  }

  const { data, error } = await supabase
    .from('subject')
    .select(`
      *,
      field!inner(code)
    `)
    .eq('field.field_id', fieldId)
    .order('subject_id');

  if (error) {
    console.error('Error fetching subjects for field code:', error);
    return [];
  }

  return data || [];
}

// ============= Topic Management =============

export async function getTopicsForSubjectCode(subjectCode: string): Promise<Topic[]> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getTopicsForSubjectCode from cached local data provider');
    return localDataProvider.getTopicsForSubjectCode(subjectCode);
  }

  // Get topics with their difficulty progression
  const { data, error } = await supabase
    .from('topic')
    .select(`
      *,
      subject!inner(code)
    `)
    .eq('subject.code', subjectCode)
    .order('topic_id');

  if (error) {
    console.error('Error fetching topics:', error);
    return [];
  }

  return data || [];
}

export async function getTopicById(topicId: number): Promise<Topic | null> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getTopicById from cached local data provider');
    return localDataProvider.getTopicById(topicId);
  }

  const { data, error } = await supabase
    .from('topic')
    .select('*')
    .eq('topic_id', topicId)
    .single();

  if (error) {
    console.error('Error fetching topic:', error);
    return null;
  }

  return data;
}

export async function getTopicByCode(code: string): Promise<Topic | null> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getTopicByCode from cached local data provider');
    return localDataProvider.getTopicByCode(code);
  }

  const { data, error } = await supabase
    .from('topic')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    console.error('Error fetching topic by code:', error);
    return null;
  }

  return data;
}

// ============= Progress Management =============

export async function getUserProgress(
  userId: string,
  topicId: number
): Promise<UserProgress | null> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .single();

  // It's okay if no progress exists yet
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user progress:', error);
    return null;
  }

  return data;
}

export async function createOrUpdateUserProgress(
  userId: string,
  topicId: number,
  stageId: number
): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      topic_id: topicId,
      stage_id: stageId
    }, {
      onConflict: 'user_id,topic_id'
    });

  if (error) {
    console.error('Error updating user progress:', error);
  }
}

export async function getTotalRepsForTopic(
  userId: string,
  topicId: number
): Promise<number> {
  const { data, error } = await supabase
    .from('session')
    .select('total_reps')
    .eq('user_id', userId)
    .eq('topic_id', topicId);

  if (error) {
    console.error('Error fetching total reps:', error);
    return 0;
  }

  return data?.reduce((sum, session) => sum + session.total_reps, 0) || 0;
}

// ============= Session Management =============

export async function createSession(
  userId: string,
  topicId: number,
  stageId: number
): Promise<Session | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('session')
    .insert({
      user_id: userId,
      topic_id: topicId,
      stage_id: stageId,
      start_time: now,
      end_time: now, // Will be updated later
      total_reps: 0,
      avg_response_time: 0,
      median_response_time: 0,
      accuracy: 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    return null;
  }

  return data;
}

// Debounced update function
let updateTimeout: NodeJS.Timeout | null = null;
export async function updateSession(
  sessionId: number,
  updates: Partial<Session>,
  immediate: boolean = false
): Promise<void> {
  const performUpdate = async () => {
    const { error } = await supabase
      .from('session')
      .update({
        ...updates,
        end_time: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session:', error);
    }
  };

  if (immediate) {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
      updateTimeout = null;
    }
    await performUpdate();
  } else {
    // Debounce updates (3 seconds)
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(performUpdate, 3000);
  }
}

// ============= Stage Progression =============

export async function getStageRequirements(
  topicId: number,
  stageCode: StageCode
): Promise<number> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getStageRequirements from cached local data provider');
    return localDataProvider.getStageRequirements(topicId, stageCode);
  }

  // Get the topic's difficulty progression
  const { data: topic, error } = await supabase
    .from('topic')
    .select(`
      *,
      difficulty_progression (*)
    `)
    .eq('topic_id', topicId)
    .single();

  if (error || !topic?.difficulty_progression) {
    console.error('Error fetching stage requirements:', error);
    return 1000; // Default fallback
  }

  // Handle both array and object response from Supabase
  const progressionData = Array.isArray(topic.difficulty_progression)
    ? topic.difficulty_progression[0]
    : topic.difficulty_progression;

  if (!progressionData) {
    return 1000; // Default fallback
  }

  const progression = progressionData as DifficultyProgression;

  // Map stage code to progression field
  switch (stageCode) {
    case 'hatsu': return progression.hatsu;
    case 'shu': return progression.shu;
    case 'kan': return progression.kan;
    case 'ha': return progression.ha;
    case 'toi': return progression.toi;
    case 'ri': return progression.ri;
    case 'ku': return Number.MAX_SAFE_INTEGER; // Ku has no requirement
    default: return 1000;
  }
}

export async function getStageById(stageId: number): Promise<Stage | null> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getStageById from cached local data provider');
    return localDataProvider.getStageById(stageId);
  }

  const { data, error } = await supabase
    .from('stage')
    .select('*')
    .eq('stage_id', stageId)
    .single();

  if (error) {
    console.error('Error fetching stage:', error);
    return null;
  }

  return data;
}

export async function checkAndAdvanceStage(
  userId: string,
  topicId: number,
  currentStageId: number,
  totalReps: number
): Promise<number> {
  // Don't advance beyond Ku (stage 7)
  if (currentStageId >= 7) return currentStageId;

  // Get current stage code
  const currentStage = await getStageById(currentStageId);
  if (!currentStage) return currentStageId;

  // Get requirement for current stage
  const requirement = await getStageRequirements(topicId, currentStage.code as StageCode);

  // Check if user has met the requirement
  if (totalReps >= requirement) {
    const newStageId = currentStageId + 1;
    await createOrUpdateUserProgress(userId, topicId, newStageId);
    return newStageId;
  }

  return currentStageId;
}

// ============= Statistics =============

export async function getSessionStats(
  userId: string,
  topicId: number,
  stageId?: number
) {
  let query = supabase
    .from('session')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId);

  if (stageId !== undefined) {
    query = query.eq('stage_id', stageId);
  }

  const { data: sessions, error } = await query;

  if (error || !sessions || sessions.length === 0) {
    return {
      totalReps: 0,
      avgResponseTime: 0,
      medianResponseTime: 0,
      accuracy: 0,
      sessionsCount: 0
    };
  }

  const totalReps = sessions.reduce((sum, s) => sum + s.total_reps, 0);
  const avgResponseTime = sessions.reduce((sum, s) => sum + s.avg_response_time, 0) / sessions.length;
  const medianResponseTime = sessions.reduce((sum, s) => sum + s.median_response_time, 0) / sessions.length;
  const accuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length;

  return {
    totalReps,
    avgResponseTime,
    medianResponseTime,
    accuracy,
    sessionsCount: sessions.length
  };
}

// ============= Recent Practice =============

export async function getRecentTopicsWithProgress(
  userId: string,
  limit: number = 10
): Promise<TopicWithProgress[]> {
  // Get recent sessions with field information
  const { data: recentSessions, error } = await supabase
    .from('session')
    .select(`
      *,
      topic:topic_id (
        *,
        subject:subject_id (
          *,
          field:field_id (*)
        )
      )
    `)
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(limit);

  if (error || !recentSessions) {
    console.error('Error fetching recent sessions:', error);
    return [];
  }

  // Get unique topic IDs
  const uniqueTopicIds = [...new Set(recentSessions.map(s => s.topic_id))];

  // Get progress for each topic
  const topicsWithProgress: TopicWithProgress[] = [];

  for (const topicId of uniqueTopicIds) {
    const sessionWithTopic = recentSessions.find(s => s.topic_id === topicId);
    if (!sessionWithTopic?.topic) continue;

    // Handle both array and object response from Supabase join
    const topicData = Array.isArray(sessionWithTopic.topic)
      ? sessionWithTopic.topic[0]
      : sessionWithTopic.topic;

    if (!topicData) continue;
    const topic = topicData as Topic;

    // Get user progress
    const progress = await getUserProgress(userId, topicId);

    // Get total reps
    const totalReps = await getTotalRepsForTopic(userId, topicId);

    // Get session count and last practiced
    const topicSessions = recentSessions.filter(s => s.topic_id === topicId);

    topicsWithProgress.push({
      ...topic,
      user_progress: progress || undefined,
      current_stage: progress ? { stage_id: progress.stage_id } as Stage : undefined,
      total_reps: totalReps,
      sessions_count: topicSessions.length,
      last_practiced: topicSessions[0]?.start_time
    });
  }

  return topicsWithProgress;
}

// ============= Difficulty Levels =============

export async function getDifficultyLevels(): Promise<DifficultyLevel[]> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getDifficultyLevels from cached local data provider');
    return localDataProvider.getDifficultyLevels();
  }

  const { data, error } = await supabase
    .from('difficulty_level')
    .select('*')
    .order('difficulty_level_id');

  if (error) {
    console.error('Error fetching difficulty levels:', error);
    return [];
  }

  return data || [];
}

export async function getDifficultyLevelsForTopic(topicId: number): Promise<DifficultyLevel[]> {
  if (USE_LOCAL_STATIC_DATA) {
    DEBUG_LOG('Fetching getDifficultyLevelsForTopic from cached local data provider');
    return localDataProvider.getDifficultyLevelsForTopic(topicId);
  }

  const { data, error } = await supabase
    .from('topic_difficulty_option')
    .select(`
      difficulty_level (*)
    `)
    .eq('topic_id', topicId);

  if (error) {
    console.error('Error fetching topic difficulty levels:', error);
    return [];
  }

  if (!data) return [];

  const difficulties: DifficultyLevel[] = [];
  for (const item of data) {
    if (item.difficulty_level) {
      // Handle both array and object response
      const difficultyData = Array.isArray(item.difficulty_level)
        ? item.difficulty_level[0]
        : item.difficulty_level;

      if (difficultyData) {
        difficulties.push(difficultyData as DifficultyLevel);
      }
    }
  }

  return difficulties;
}