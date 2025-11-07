/**
 * Database type definitions for the 7-stage Shuhari architecture
 * These types match the schema defined in supabase/migrations/004_new_architecture.sql
 */

// ============= Core Entities =============

export interface Stage {
  stage_id: number; // 1-7
  code: string; // hatsu, shu, kan, ha, toi, ri, ku
  symbol: string; // e.g., "初" for Hatsu
  name: string; // e.g., "Hatsu"
  translation: string; // e.g., "Begin"
  display_name: string; // e.g., "初 - Hatsu (Begin)"
  description: string;
  rep_threshold: number; // Minimum reps required to enter into this stage
  reps_in_stage: number; // Number of reps to complete this stage
}

export interface DifficultyProgression {
  difficulty_progression_id: number;
  code: string;  // 'standard' or 'kids_mode'
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
  symbol: string;
  tw_color: string | null | undefined;
  description: string;
}

export interface Subject {
  subject_id: number; // e.g., 101001 for arithmetic
  code: string; // 'arithmetic'
  field_id: number;
  display_name: string; // 'Arithmetic'
  symbol: string;
  is_active: boolean;
  tw_color: string | null | undefined;
  description: string;
}

export interface Unit {
  unit_id: number; // e.g., 10100101 for basic operations
  code: string; // 'basic-ops', 'mult-div', etc.
  subject_id: number;
  display_name: string; // 'Basic Operations', 'Multiplication & Division', etc.
  symbol: string;
  is_active: boolean;
  tw_color: string | null | undefined;
  description: string;
}

export interface Topic {
  topic_id: number; // Auto-incrementing
  code: string; // 'add', 'sub', 'mul', etc.
  symbol: string; // e.g., "+", "-", "×", "÷"
  unit_id: number; // Reference to unit instead of subject
  difficulty_progression_id: number | null; // defaults to 1 (standard)
  display_name: string; // 'Addition', 'Subtraction', etc.
  is_active: boolean;
  tw_color: string | null | undefined;
  description: string;
}

export interface TopicDifficultyOption {
  topic_difficulty_option_id: number;
  topic_id: number;
  difficulty_level_id: number;
}

// ============= User Data =============

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

export interface ExtendedSubject extends Subject {
  field: Field;
}

export interface ExtendedUnit extends Unit {
  subject: Subject;
  field: Field;
}

export interface ExtendedTopic extends Topic {
  unit: Unit;
  subject: Subject;
  field: Field;
  difficulty_progression?: DifficultyProgression;
}


// ============= Helper Types =============

export type StageCode = 'hatsu' | 'shu' | 'kan' | 'ha' | 'toi' | 'ri' | 'ku';
export type ProgressionCode = 'standard' | 'kids_mode';

