import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type User = {
  id: string;
  username: string | null;
  created_at: string;
  updated_at: string;
};

export type PracticeSession = {
  id: string;
  user_id: string;
  subject: string;
  module: string;
  total_reps: number;
  session_avg_response_time: number;
  current_level: 'shu' | 'ha' | 'ri';
  last_practiced_at: string;
  created_at: string;
  updated_at: string;
};

// Removed ProblemAttempt type - no longer tracking individual attempts

// Helper functions for practice sessions
export async function createPracticeSession(
  userId: string,
  subject: string,
  module: string
): Promise<PracticeSession | null> {
  // Always create a new session
  const { data: newSession, error: createError } = await supabase
    .from('practice_sessions')
    .insert({
      user_id: userId,
      subject,
      module,
      total_reps: 0,
      session_avg_response_time: 0,
      current_level: 'shu',
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating practice session:', createError);
    return null;
  }

  return newSession as PracticeSession;
}

export async function updatePracticeSession(
  sessionId: string,
  updates: Partial<PracticeSession>
): Promise<boolean> {
  const { error } = await supabase
    .from('practice_sessions')
    .update({
      ...updates,
      last_practiced_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating practice session:', error);
    return false;
  }

  return true;
}

export async function getTotalRepsForModule(
  userId: string,
  subject: string,
  module: string
): Promise<number> {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('total_reps')
    .eq('user_id', userId)
    .eq('subject', subject)
    .eq('module', module);

  if (error) {
    console.error('Error fetching total reps:', error);
    return 0;
  }

  return data.reduce((sum, session) => sum + (session.total_reps || 0), 0);
}

export async function getLastSessionAvgResponseTime(
  userId: string,
  subject: string,
  module: string
): Promise<number> {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('session_avg_response_time')
    .eq('user_id', userId)
    .eq('subject', subject)
    .eq('module', module)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return 0;
  }

  return data.session_avg_response_time || 0;
}

// Removed recordProblemAttempt function - no longer tracking individual attempts

// Get or create a user (simple version without auth)
export async function getOrCreateUser(username: string): Promise<string | null> {
  // Check if user exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create new user
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ username })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return newUser.id;
}

// Get recent practice sessions for display on home page
export async function getRecentPracticeSessions(limit: number = 5): Promise<PracticeSession[]> {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .order('last_practiced_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent practice sessions:', error);
    return [];
  }

  return data as PracticeSession[];
}
