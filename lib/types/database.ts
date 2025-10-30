/**
 * Database type definitions for the 7-stage Shuhari architecture
 * These types match the schema defined in supabase/migrations/004_new_architecture.sql
 */

// ============= Core Entities =============

export interface Stage {
  stage_id: number; // 1-7
  code: string; // hatsu, shu, kan, ha, toi, ri, ku
  display_name: string; // e.g., "初 - Hatsu (Begin)"
}

export interface DifficultyProgression {
  difficulty_progression_id: number;
  code: string; // 'standard' or 'kids_mode'
  hatsu: number; // reps required for Hatsu stage
  shu: number;   // reps required for Shu stage
  kan: number;   // reps required for Kan stage
  ha: number;    // reps required for Ha stage
  toi: number;   // reps required for Toi stage
  ri: number;    // reps required for Ri stage
  // Note: No 'ku' column - Ku stage has no progression requirement
}

export interface DifficultyLevel {
  difficulty_level_id: number; // 101-105
  code: string; // '1d', '2d', '3d', '4d', '5d'
  display_name: string; // Seedling, Sapling, Bamboo, Cedar, Ancient Oak
  character: string; // Japanese character
  pronunciation: string | null; // Japanese pronunciation
  description: string | null;
}

// ============= Content Hierarchy =============

export interface Field {
  field_id: number; // e.g., 101 for math
  code: string; // 'math', 'chemistry', etc.
  display_name: string; // 'Mathematics'
  is_active: boolean;
}

export interface Subject {
  subject_id: number; // e.g., 101001 for arithmetic
  code: string; // 'arithmetic'
  field_id: number;
  display_name: string; // 'Arithmetic'
}

export interface Topic {
  topic_id: number; // Auto-incrementing
  code: string; // 'add', 'sub', 'mul', etc.
  subject_id: number;
  difficulty_progression_id: number | null; // defaults to 1 (standard)
  display_name: string; // 'Addition', 'Subtraction', etc.
}

export interface TopicDifficultyOption {
  topic_difficulty_option_id: number;
  topic_id: number;
  difficulty_level_id: number;
}

// ============= User Data =============

export interface UserProgress {
  user_id: string; // UUID
  topic_id: number;
  stage_id: number;
}

export interface Session {
  id: number; // Auto-incrementing
  user_id: string; // UUID
  topic_id: number;
  stage_id: number;
  start_time: Date | string; // TIMESTAMP
  end_time: Date | string; // TIMESTAMP
  total_reps: number;
  avg_response_time: number; // in milliseconds (stored as FLOAT)
  median_response_time: number; // in milliseconds (stored as FLOAT)
  accuracy: number; // 0.0 to 1.0
}

// ============= Composite Types (with joins) =============

export interface SubjectWithField extends Subject {
  field?: Field;
}

export interface TopicWithSubject extends Topic {
  subject?: Subject;
  difficulty_progression?: DifficultyProgression;
}

export interface TopicWithProgress extends Topic {
  subject?: Subject;
  difficulty_progression?: DifficultyProgression;
  user_progress?: UserProgress;
  current_stage?: Stage;
  difficulty_options?: DifficultyLevel[];
  total_reps?: number;
  sessions_count?: number;
  last_practiced?: Date | string;
}

export interface SessionWithDetails extends Session {
  topic?: Topic;
  stage?: Stage;
}

// ============= Helper Types =============

export type StageCode = 'hatsu' | 'shu' | 'kan' | 'ha' | 'toi' | 'ri' | 'ku';
export type DifficultyCode = '1d' | '2d' | '3d' | '4d' | '5d';
export type ProgressionCode = 'standard' | 'kids_mode';

// ============= Constants =============

export const STAGE_ORDER: StageCode[] = ['hatsu', 'shu', 'kan', 'ha', 'toi', 'ri', 'ku'];

export const STAGE_DISPLAY_NAMES: Record<number, string> = {
  1: '初 - Hatsu (Begin)',
  2: '守 - Shu (Obey)',
  3: '鑑 - Kan (Mirror)',
  4: '破 - Ha (Break)',
  5: '問 - Toi (Question)',
  6: '離 - Ri (Leave)',
  7: '空 - Ku (Void)'
};

export const DIFFICULTY_DISPLAY_NAMES: Record<number, string> = {
  101: 'Seedling',
  102: 'Sapling',
  103: 'Bamboo',
  104: 'Cedar',
  105: 'Ancient Oak'
};

// Mapping from old module names to new topic IDs
// This will be dynamically determined from the database, but here for reference
export const MODULE_TO_TOPIC_CODE: Record<string, string> = {
  'addition': 'add',
  'subtraction': 'sub',
  'multiplication': 'mul',
  'division': 'div',
  'modulus': 'mod',
  'exponents': 'exp',
  'square-roots': 'root',
  'negatives-addition': 'add_w_negatives',
  'negatives-subtraction': 'subtract_w_negatives'
};

// Helper function to get stage name
export function getStageName(stageId: number): string {
  return STAGE_DISPLAY_NAMES[stageId] || 'Unknown';
}

// Helper function to get difficulty name
export function getDifficultyName(difficultyId: number): string {
  return DIFFICULTY_DISPLAY_NAMES[difficultyId] || 'Unknown';
}

// Helper function to calculate progress percentage
export function calculateProgress(
  currentReps: number,
  requiredReps: number
): number {
  if (requiredReps === 0) return 100;
  return Math.min(100, Math.round((currentReps / requiredReps) * 100));
}