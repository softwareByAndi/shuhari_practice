-- Create users table (simple version, can be extended with Supabase Auth later)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create practice_sessions table to track each practice module's progress
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL, -- 'math', 'chemistry', etc.
  module TEXT NOT NULL, -- 'addition', 'subtraction', etc.
  score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  sets_completed INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  current_level TEXT DEFAULT 'shu', -- 'shu', 'ha', 'ri'
  last_practiced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject, module)
);


-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_subject_module ON practice_sessions(user_id, subject, module);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_sessions_updated_at
  BEFORE UPDATE ON practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic policies - can be refined based on auth strategy)
-- For now, allow all operations (you'll want to restrict this with auth)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on practice_sessions" ON practice_sessions
  FOR ALL USING (true) WITH CHECK (true);
