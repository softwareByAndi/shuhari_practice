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

// Get current authenticated user ID
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Create user profile when they sign up (call this after successful auth)
export async function createUserProfile(userId: string, email: string): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .insert({
      id: userId,
      username: email.split('@')[0], // Use email prefix as default username
    });

  if (error) {
    console.error('Error creating user profile:', error);
    return false;
  }

  return true;
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

// Get recent practice sessions with total reps aggregated by module
export async function getRecentPracticeSessionsWithTotals(limit: number = 5): Promise<(PracticeSession & { module_total_reps: number })[]> {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .order('last_practiced_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent practice sessions:', error);
    return [];
  }

  const sessions = data as PracticeSession[];

  // For each session, get the total reps across all sessions for that module
  const sessionsWithTotals = await Promise.all(
    sessions.map(async (session) => {
      const { data: moduleSessions, error: moduleError } = await supabase
        .from('practice_sessions')
        .select('total_reps')
        .eq('user_id', session.user_id)
        .eq('subject', session.subject)
        .eq('module', session.module);

      if (moduleError || !moduleSessions) {
        return { ...session, module_total_reps: session.total_reps };
      }

      const totalReps = moduleSessions.reduce((sum, s) => sum + (s.total_reps || 0), 0);
      return { ...session, module_total_reps: totalReps };
    })
  );

  return sessionsWithTotals;
}

// Get unique recent modules with aggregated data and response time history
export type ModuleSummary = {
  user_id: string;
  subject: string;
  module: string;
  current_level: 'shu' | 'ha' | 'ri';
  module_total_reps: number;
  last_practiced_at: string;
  response_time_history: number[]; // Last 10 session avg response times
  latest_avg_response_time: number;
};

export async function getRecentModulesWithHistory(limit: number = 10): Promise<ModuleSummary[]> {
  // Get all recent sessions
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .order('last_practiced_at', { ascending: false });

  if (error) {
    console.error('Error fetching recent practice sessions:', error);
    return [];
  }

  const sessions = data as PracticeSession[];

  // Group by user_id + subject + module to get unique modules
  const moduleMap = new Map<string, PracticeSession[]>();

  sessions.forEach((session) => {
    const key = `${session.user_id}-${session.subject}-${session.module}`;
    if (!moduleMap.has(key)) {
      moduleMap.set(key, []);
    }
    moduleMap.get(key)!.push(session);
  });

  // Convert to array and take the most recent modules
  const uniqueModules = Array.from(moduleMap.entries())
    .map(([_, moduleSessions]) => {
      // Sort sessions by last_practiced_at descending
      moduleSessions.sort((a, b) =>
        new Date(b.last_practiced_at).getTime() - new Date(a.last_practiced_at).getTime()
      );

      const mostRecent = moduleSessions[0];
      const totalReps = moduleSessions.reduce((sum, s) => sum + (s.total_reps || 0), 0);

      // Get last 10 session avg response times (most recent first)
      const responseTimeHistory = moduleSessions
        .slice(0, 10)
        .map(s => s.session_avg_response_time)
        .reverse(); // Reverse to show oldest to newest for the graph

      return {
        user_id: mostRecent.user_id,
        subject: mostRecent.subject,
        module: mostRecent.module,
        current_level: mostRecent.current_level,
        module_total_reps: totalReps,
        last_practiced_at: mostRecent.last_practiced_at,
        response_time_history: responseTimeHistory,
        latest_avg_response_time: mostRecent.session_avg_response_time,
      };
    })
    .sort((a, b) =>
      new Date(b.last_practiced_at).getTime() - new Date(a.last_practiced_at).getTime()
    )
    .slice(0, limit);

  return uniqueModules;
}
