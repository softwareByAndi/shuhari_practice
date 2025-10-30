# Technical Migration Plan: 7-Stage Architecture Implementation

## Overview

This document provides detailed technical specifications for migrating from the current 3-stage system to the new 7-stage architecture with hierarchical organization (Field → Subject → Topic) and configurable difficulty progressions.

## Database Migration Details

### New Table Relationships

```sql
field (1) → (N) subject
subject (1) → (N) topic
topic (1) → (N) topic_difficulty_option → (1) difficulty_level
topic (1) → (1) difficulty_progression

user (1) → (N) user_progress → (1) topic, stage
user (1) → (N) session → (1) topic, stage
```

### Data Migration Script

```sql
-- Migrate existing practice_sessions to new session table
INSERT INTO session (
    user_id,
    topic_id,
    stage_id,
    start_time,
    end_time,
    total_reps,
    avg_response_time,
    median_response_time,
    accuracy
)
SELECT
    ps.user_id,
    t.topic_id,
    CASE ps.current_level
        WHEN 'shu' THEN 2  -- Map to Shu stage
        WHEN 'ha' THEN 4   -- Map to Ha stage
        WHEN 'ri' THEN 6   -- Map to Ri stage
    END as stage_id,
    ps.created_at as start_time,
    ps.updated_at as end_time,
    ps.total_reps,
    ps.session_avg_response_time as avg_response_time,
    ps.session_avg_response_time as median_response_time, -- Approximate
    1.0 as accuracy -- Assume 100% for historical data
FROM practice_sessions ps
JOIN topic t ON
    CASE WHEN ps.module ILIKE '%addition%' THEN 'add'
         WHEN ps.module ILIKE '%subtraction%' THEN 'sub'
         WHEN ps.module ILIKE '%multiplication%' THEN 'mul'
         WHEN ps.module ILIKE '%division%' THEN 'div'
         WHEN ps.module ILIKE '%modulus%' THEN 'mod'
         WHEN ps.module ILIKE '%exponents%' THEN 'exp'
         WHEN ps.module ILIKE '%square-roots%' THEN 'root'
         WHEN ps.module ILIKE '%negatives-addition%' THEN 'add_w_negatives'
         WHEN ps.module ILIKE '%negatives-subtraction%' THEN 'subtract_w_negatives'
    END = t.code;

-- Create user_progress records
INSERT INTO user_progress (user_id, topic_id, stage_id)
SELECT DISTINCT
    s.user_id,
    s.topic_id,
    MAX(s.stage_id) as current_stage
FROM session s
GROUP BY s.user_id, s.topic_id;
```

## New Type Definitions

### TypeScript Interfaces

```typescript
// lib/types/database.ts

export interface Stage {
  stage_id: number;
  code: string;
  display_name: string;
}

export interface DifficultyLevel {
  difficulty_level_id: number;
  code: string;
  display_name: string;
  character: string;
  pronunciation: string;
  description: string;
}

export interface DifficultyProgression {
  difficulty_progression_id: number;
  code: string;
  hatsu: number;
  shu: number;
  kan: number;
  ha: number;
  toi: number;
  ri: number;
}

export interface Field {
  field_id: number;
  code: string;
  display_name: string;
  is_active: boolean;
}

export interface Subject {
  subject_id: number;
  code: string;
  field_id: number;
  display_name: string;
}

export interface Topic {
  topic_id: number;
  code: string;
  subject_id: number;
  difficulty_progression_id: number;
  display_name: string;
}

export interface TopicDifficultyOption {
  topic_difficulty_option_id: number;
  topic_id: number;
  difficulty_level_id: number;
}

export interface UserProgress {
  user_id: string;
  topic_id: number;
  stage_id: number;
}

export interface Session {
  id: number;
  user_id: string;
  topic_id: number;
  stage_id: number;
  start_time: Date;
  end_time: Date;
  total_reps: number;
  avg_response_time: number;
  median_response_time: number;
  accuracy: number;
}

export interface TopicWithProgress extends Topic {
  current_stage?: Stage;
  total_reps?: number;
  sessions_count?: number;
  last_practiced?: Date;
  available_difficulties?: DifficultyLevel[];
}
```

## Updated Supabase Client Functions

### Core Database Functions

```typescript
// lib/supabase-v2.ts

import { createClient } from '@supabase/supabase-js';
import type {
  Field, Subject, Topic, Stage, DifficultyLevel, TopicDifficultyOption,
  UserProgress, Session, TopicWithProgress, DifficultyProgression
} from './types/database';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// === Field & Subject Management ===

export async function getActiveFields(): Promise<Field[]> {
  const { data, error } = await supabase
    .from('field')
    .select('*')
    .eq('is_active', true)
    .order('field_id');

  if (error) throw error;
  return data || [];
}

export async function getSubjectsForField(fieldId: number): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subject')
    .select('*')
    .eq('field_id', fieldId)
    .order('subject_id');

  if (error) throw error;
  return data || [];
}

// === Topic Management ===

export async function getTopicsForSubject(
  userId: string,
  subjectId: number
): Promise<TopicWithProgress[]> {
  // Get topics with user progress
  const { data: topics, error: topicsError } = await supabase
    .from('topic')
    .select(`
      *,
      user_progress!left(stage_id),
      topic_difficulty_option(
        difficulty_level(*)
      )
    `)
    .eq('subject_id', subjectId)
    .eq('user_progress.user_id', userId);

  if (topicsError) throw topicsError;

  // Get session stats for each topic
  const topicIds = topics?.map(t => t.topic_id) || [];
  const { data: sessionStats } = await supabase
    .from('session')
    .select('topic_id, total_reps, start_time')
    .eq('user_id', userId)
    .in('topic_id', topicIds);

  // Combine data
  return topics?.map(topic => {
    const stats = sessionStats?.filter(s => s.topic_id === topic.topic_id) || [];
    const totalReps = stats.reduce((sum, s) => sum + s.total_reps, 0);
    const lastSession = stats.sort((a, b) =>
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    )[0];

    return {
      ...topic,
      current_stage: topic.user_progress?.[0]?.stage_id,
      total_reps: totalReps,
      sessions_count: stats.length,
      last_practiced: lastSession?.start_time,
      available_difficulties: topic.topic_difficulty_option?.map(
        (tdo: any) => tdo.difficulty_level
      )
    };
  }) || [];
}

// === Progress Management ===

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

  if (error && error.code !== 'PGRST116') throw error; // Allow not found
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

  if (error) throw error;
}

// === Session Management ===

export async function createSession(
  session: Omit<Session, 'id'>
): Promise<Session> {
  const { data, error } = await supabase
    .from('session')
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSession(
  sessionId: number,
  updates: Partial<Session>
): Promise<void> {
  const { error } = await supabase
    .from('session')
    .update(updates)
    .eq('id', sessionId);

  if (error) throw error;
}

// === Stage Progression ===

export async function getStageRequirements(
  topicId: number,
  stageId: number
): Promise<number> {
  // Get topic's difficulty progression
  const { data: topic } = await supabase
    .from('topic')
    .select('difficulty_progression(*)')
    .eq('topic_id', topicId)
    .single();

  if (!topic?.difficulty_progression) return 1000; // Default

  // Get stage code
  const { data: stage } = await supabase
    .from('stage')
    .select('code')
    .eq('stage_id', stageId)
    .single();

  if (!stage) return 1000;

  // Return requirement for stage
  const progression = topic.difficulty_progression as DifficultyProgression;
  const stageCode = stage.code as keyof DifficultyProgression;
  return progression[stageCode] as number || 1000;
}

export async function checkAndAdvanceStage(
  userId: string,
  topicId: number,
  currentStageId: number,
  totalReps: number
): Promise<number> {
  // Get requirement for next stage
  const nextStageId = currentStageId + 1;
  if (nextStageId > 7) return currentStageId; // Max stage

  const requirement = await getStageRequirements(topicId, currentStageId);

  if (totalReps >= requirement) {
    await createOrUpdateUserProgress(userId, topicId, nextStageId);
    return nextStageId;
  }

  return currentStageId;
}

// === Statistics ===

export async function getSessionStats(
  userId: string,
  topicId: number,
  stageId?: number
): Promise<{
  totalReps: number;
  avgResponseTime: number;
  medianResponseTime: number;
  accuracy: number;
  sessionsCount: number;
}> {
  let query = supabase
    .from('session')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId);

  if (stageId) {
    query = query.eq('stage_id', stageId);
  }

  const { data: sessions } = await query;

  if (!sessions || sessions.length === 0) {
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
```

## Updated Problem Generator

```typescript
// lib/problem-generator-v2.ts

import { DifficultyLevel, Stage } from './types/database';

export interface ProblemConfig {
  topicCode: string;
  stageId: number;
  difficultyLevelId: number;
}

export interface Problem {
  question: string;
  answer: number;
  difficulty: number;
  metadata?: Record<string, any>;
}

export function generateProblems(config: ProblemConfig): Problem[] {
  const { topicCode, stageId, difficultyLevelId } = config;

  // Determine problem parameters based on stage and difficulty
  const complexity = getComplexity(stageId, difficultyLevelId);

  switch (topicCode) {
    case 'add':
      return generateAdditionProblems(complexity);
    case 'sub':
      return generateSubtractionProblems(complexity);
    case 'mul':
      return generateMultiplicationProblems(complexity);
    // ... other topics
    default:
      throw new Error(`Unknown topic: ${topicCode}`);
  }
}

function getComplexity(stageId: number, difficultyLevelId: number): {
  minDigits: number;
  maxDigits: number;
  count: number;
  allowNegatives: boolean;
  allowDecimals: boolean;
} {
  // Stage-based complexity
  const stageComplexity = {
    1: { base: 1, multiplier: 0.5 },  // Hatsu
    2: { base: 1, multiplier: 1 },     // Shu
    3: { base: 1, multiplier: 1.5 },   // Kan
    4: { base: 2, multiplier: 1 },     // Ha
    5: { base: 2, multiplier: 1.5 },   // Toi
    6: { base: 3, multiplier: 1 },     // Ri
    7: { base: 3, multiplier: 2 },     // Ku
  };

  // Difficulty level adjustments
  const difficultyAdjustment = {
    101: { digits: 0, negative: false, decimal: false }, // Seedling
    102: { digits: 0, negative: false, decimal: false }, // Sapling
    103: { digits: 1, negative: true, decimal: false },  // Bamboo
    104: { digits: 1, negative: true, decimal: true },   // Cedar
    105: { digits: 2, negative: true, decimal: true },   // Ancient Oak
  };

  const stage = stageComplexity[stageId] || stageComplexity[1];
  const difficulty = difficultyAdjustment[difficultyLevelId] || difficultyAdjustment[101];

  return {
    minDigits: stage.base,
    maxDigits: stage.base + difficulty.digits,
    count: Math.floor(50 * stage.multiplier),
    allowNegatives: difficulty.negative && stageId >= 4,
    allowDecimals: difficulty.decimal && stageId >= 6
  };
}

function generateAdditionProblems(complexity: ReturnType<typeof getComplexity>): Problem[] {
  const problems: Problem[] = [];
  const { minDigits, maxDigits, count, allowNegatives } = complexity;

  const min = allowNegatives ? -Math.pow(10, maxDigits - 1) : 0;
  const max = Math.pow(10, maxDigits) - 1;

  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * (max - min + 1)) + min;
    const b = Math.floor(Math.random() * (max - min + 1)) + min;

    problems.push({
      question: `${a} + ${b}`,
      answer: a + b,
      difficulty: maxDigits,
      metadata: { a, b, operation: 'addition' }
    });
  }

  return problems;
}

// Similar implementations for other operations...
```

## Updated Practice Component

```typescript
// app/practice/[field]/[subject]/[topic]/practice/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  getUserProgress,
  createSession,
  updateSession,
  checkAndAdvanceStage,
  getStageRequirements
} from '@/lib/supabase-v2';
import { generateProblems, Problem } from '@/lib/problem-generator-v2';
import { useAuth } from '@/contexts/AuthContext';

export default function PracticePage() {
  const { field, subject, topic } = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Session tracking
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState({
    totalReps: 0,
    correctAnswers: 0,
    responseTimes: [] as number[],
    startTime: new Date()
  });

  // Progress tracking
  const [currentStage, setCurrentStage] = useState(1);
  const [stageProgress, setStageProgress] = useState(0);
  const [stageRequirement, setStageRequirement] = useState(1000);

  // Initialize session
  useEffect(() => {
    async function initializeSession() {
      if (!user?.id) return;

      // Get user progress
      const progress = await getUserProgress(user.id, topicId);
      const stageId = progress?.stage_id || 1;
      setCurrentStage(stageId);

      // Get stage requirements
      const requirement = await getStageRequirements(topicId, stageId);
      setStageRequirement(requirement);

      // Generate problems
      const problems = generateProblems({
        topicCode: topic as string,
        stageId,
        difficultyLevelId: parseInt(searchParams.get('difficulty') || '101')
      });
      setProblems(problems);

      // Create session
      const session = await createSession({
        user_id: user.id,
        topic_id: topicId,
        stage_id: stageId,
        start_time: new Date(),
        end_time: new Date(),
        total_reps: 0,
        avg_response_time: 0,
        median_response_time: 0,
        accuracy: 0
      });
      setSessionId(session.id);
    }

    initializeSession();
  }, [user, topic]);

  // Handle answer submission
  const handleSubmit = useCallback(async () => {
    const currentProblem = problems[currentProblemIndex];
    const isCorrect = parseFloat(userAnswer) === currentProblem.answer;
    const responseTime = Date.now() - problemStartTime;

    // Update feedback
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    // Update session stats
    const newStats = {
      ...sessionStats,
      totalReps: sessionStats.totalReps + 1,
      correctAnswers: sessionStats.correctAnswers + (isCorrect ? 1 : 0),
      responseTimes: [...sessionStats.responseTimes, responseTime]
    };
    setSessionStats(newStats);

    // Calculate metrics
    const accuracy = newStats.correctAnswers / newStats.totalReps;
    const avgResponseTime = newStats.responseTimes.reduce((a, b) => a + b, 0) / newStats.responseTimes.length;
    const medianResponseTime = calculateMedian(newStats.responseTimes);

    // Update session in database (debounced)
    if (sessionId) {
      await updateSession(sessionId, {
        total_reps: newStats.totalReps,
        avg_response_time: avgResponseTime,
        median_response_time: medianResponseTime,
        accuracy,
        end_time: new Date()
      });
    }

    // Check for stage advancement
    const totalRepsForTopic = await getTotalRepsForTopic(user!.id, topicId);
    const newStage = await checkAndAdvanceStage(
      user!.id,
      topicId,
      currentStage,
      totalRepsForTopic
    );

    if (newStage > currentStage) {
      // Show stage advancement celebration
      showStageAdvancement(newStage);
      setCurrentStage(newStage);
    }

    // Move to next problem
    setTimeout(() => {
      if (currentProblemIndex < problems.length - 1) {
        setCurrentProblemIndex(currentProblemIndex + 1);
        setUserAnswer('');
        setFeedback(null);
      } else {
        // Set complete
        showCompletionModal();
      }
    }, 1000);
  }, [userAnswer, currentProblemIndex, problems, sessionStats, sessionId, currentStage]);

  // Render UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Stage Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between mb-2">
          <span>Stage: {getStageName(currentStage)}</span>
          <span>{stageProgress} / {stageRequirement} reps</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(stageProgress / stageRequirement) * 100}%` }}
          />
        </div>
      </div>

      {/* Problem Display */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">
            {problems[currentProblemIndex]?.question}
          </h2>
          <div className="text-sm text-gray-500">
            Problem {currentProblemIndex + 1} of {problems.length}
          </div>
        </div>

        {/* Answer Input */}
        <div className="flex flex-col items-center">
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className={`text-2xl p-4 border-2 rounded-lg w-48 text-center ${
              feedback === 'correct' ? 'border-green-500 bg-green-50' :
              feedback === 'incorrect' ? 'border-red-500 bg-red-50' :
              'border-gray-300'
            }`}
            autoFocus
          />

          {feedback && (
            <div className={`mt-4 text-lg font-semibold ${
              feedback === 'correct' ? 'text-green-600' : 'text-red-600'
            }`}>
              {feedback === 'correct' ? '✓ Correct!' : '✗ Try again'}
            </div>
          )}
        </div>

        {/* Session Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{sessionStats.totalReps}</div>
            <div className="text-sm text-gray-500">Total Reps</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {(sessionStats.correctAnswers / sessionStats.totalReps * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {calculateMedian(sessionStats.responseTimes).toFixed(1)}s
            </div>
            <div className="text-sm text-gray-500">Median Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Navigation Structure Updates

### New Route Structure

```
/                                    → Field selection (Math, Science, etc.)
/practice/[field]                   → Subject selection
/practice/[field]/[subject]         → Topic selection with progress
/practice/[field]/[subject]/[topic] → Practice interface

Examples:
/practice/math                      → Shows Arithmetic, Algebra, Geometry
/practice/math/arithmetic           → Shows Addition, Subtraction, etc.
/practice/math/arithmetic/addition  → Practice addition problems
```

### URL Parameter Changes

```typescript
// Old URL format
/practice/math/equations/addition/practice?digits=1

// New URL format
/practice/math/arithmetic/addition?stage=2&difficulty=101

// Migration mapping
const urlMigrationMap = {
  '/practice/math/equations/addition/practice?digits=1':
    '/practice/math/arithmetic/addition?stage=2&difficulty=101',
  '/practice/math/equations/addition/practice?digits=2':
    '/practice/math/arithmetic/addition?stage=4&difficulty=103',
  // ... etc
};
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/supabase-v2.test.ts

describe('Stage Progression', () => {
  it('should advance from Hatsu to Shu after 1000 reps', async () => {
    const result = await checkAndAdvanceStage('user-id', 1, 1, 1000);
    expect(result).toBe(2); // Shu
  });

  it('should not advance if requirements not met', async () => {
    const result = await checkAndAdvanceStage('user-id', 1, 1, 999);
    expect(result).toBe(1); // Still Hatsu
  });
});

describe('Problem Generation', () => {
  it('should generate appropriate complexity for each stage', () => {
    const hatsuProblems = generateProblems({
      topicCode: 'add',
      stageId: 1,
      difficultyLevelId: 101
    });
    expect(hatsuProblems[0].question).toMatch(/^\d \+ \d$/);

    const riProblems = generateProblems({
      topicCode: 'add',
      stageId: 6,
      difficultyLevelId: 105
    });
    expect(riProblems[0].question).toMatch(/^-?\d+ \+ -?\d+$/);
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/practice-flow.test.ts

describe('Complete Practice Flow', () => {
  it('should handle full session from start to stage advancement', async () => {
    // 1. Initialize session
    const session = await createSession({...});
    expect(session.id).toBeDefined();

    // 2. Submit answers
    for (let i = 0; i < 1000; i++) {
      await submitAnswer(session.id, {...});
    }

    // 3. Check stage advancement
    const progress = await getUserProgress('user-id', 1);
    expect(progress.stage_id).toBe(2); // Advanced to Shu
  });
});
```

## Monitoring & Metrics

### Key Performance Indicators

```sql
-- Query to monitor migration health
SELECT
    COUNT(DISTINCT user_id) as active_users,
    AVG(accuracy) as avg_accuracy,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY median_response_time) as p50_response_time,
    COUNT(*) as total_sessions,
    SUM(total_reps) as total_reps
FROM session
WHERE start_time > NOW() - INTERVAL '24 hours';

-- Stage distribution
SELECT
    s.display_name,
    COUNT(DISTINCT up.user_id) as users_at_stage
FROM stage s
LEFT JOIN user_progress up ON s.stage_id = up.stage_id
GROUP BY s.stage_id, s.display_name
ORDER BY s.stage_id;
```

### Error Tracking

```typescript
// lib/monitoring.ts

export function trackMigrationError(context: string, error: any) {
  console.error(`Migration Error [${context}]:`, error);

  // Send to monitoring service
  if (typeof window !== 'undefined') {
    window.sentry?.captureException(error, {
      tags: {
        migration: 'v2-7-stage',
        context
      }
    });
  }
}

// Usage
try {
  await migrateUserData(userId);
} catch (error) {
  trackMigrationError('user_data_migration', error);
  // Fallback to old system
  return useOldSystem();
}
```

## Rollback Procedures

### Quick Rollback Script

```sql
-- Create backup tables before migration
CREATE TABLE practice_sessions_backup AS SELECT * FROM practice_sessions;
CREATE TABLE users_backup AS SELECT * FROM users;

-- Rollback script
BEGIN;

-- Restore old tables
DROP TABLE IF EXISTS practice_sessions CASCADE;
ALTER TABLE practice_sessions_backup RENAME TO practice_sessions;

-- Remove new tables
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS topic_difficulty_option CASCADE;
DROP TABLE IF EXISTS topic CASCADE;
DROP TABLE IF EXISTS subject CASCADE;
DROP TABLE IF EXISTS field CASCADE;
DROP TABLE IF EXISTS difficulty_level CASCADE;
DROP TABLE IF EXISTS difficulty_progression CASCADE;
DROP TABLE IF EXISTS stage CASCADE;

COMMIT;
```

### Code Rollback

```typescript
// lib/feature-flags.ts

export const USE_NEW_ARCHITECTURE = process.env.NEXT_PUBLIC_USE_NEW_ARCH === 'true';

// In components
import { USE_NEW_ARCHITECTURE } from '@/lib/feature-flags';
import * as supabaseV1 from '@/lib/supabase';
import * as supabaseV2 from '@/lib/supabase-v2';

const supabase = USE_NEW_ARCHITECTURE ? supabaseV2 : supabaseV1;
```

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing (unit, integration, e2e)
- [ ] Performance benchmarks met
- [ ] Database backup completed
- [ ] Feature flags configured
- [ ] Rollback scripts tested
- [ ] Team notified of deployment window

### During Deployment
- [ ] Apply database migrations
- [ ] Run data migration scripts
- [ ] Deploy new code with feature flag OFF
- [ ] Test with small user group
- [ ] Monitor error rates
- [ ] Gradually increase feature flag percentage

### Post-deployment
- [ ] Verify all metrics within acceptable ranges
- [ ] Check user feedback channels
- [ ] Document any issues encountered
- [ ] Plan follow-up improvements
- [ ] Schedule old code removal (after 30 days)

## Conclusion

This technical migration plan provides a comprehensive roadmap for implementing the new 7-stage architecture. The key to success is:

1. **Incremental migration** - Using feature flags and parallel systems
2. **Comprehensive testing** - Unit, integration, and performance tests
3. **Monitoring** - Real-time tracking of key metrics
4. **Rollback capability** - Quick reversion if issues arise
5. **Clear communication** - Keeping the team informed throughout

The migration should be completed over 3-4 weeks, with careful monitoring at each phase to ensure system stability and user satisfaction.