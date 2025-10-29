-- Remove UNIQUE constraint and simplify practice_sessions table
-- Drop the existing unique constraint
ALTER TABLE practice_sessions DROP CONSTRAINT IF EXISTS practice_sessions_user_id_subject_module_key;

-- Remove unnecessary columns
ALTER TABLE practice_sessions DROP COLUMN IF EXISTS score;
ALTER TABLE practice_sessions DROP COLUMN IF EXISTS attempts;
ALTER TABLE practice_sessions DROP COLUMN IF EXISTS sets_completed;

-- Add session_avg_response_time column (in milliseconds)
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS session_avg_response_time INTEGER DEFAULT 0;

-- Update index to be non-unique
DROP INDEX IF EXISTS idx_practice_sessions_user_subject_module;
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_subject_module ON practice_sessions(user_id, subject, module);
