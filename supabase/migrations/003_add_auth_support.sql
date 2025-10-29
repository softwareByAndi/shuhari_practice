-- Migration to add Supabase Auth support and Row Level Security
-- This migration updates the users table to use Supabase Auth user IDs
-- and adds RLS policies to secure user data

-- Step 1: Update users table to use auth.users.id as primary key
-- First, we need to handle existing data carefully

-- Drop existing foreign key constraints
ALTER TABLE practice_sessions DROP CONSTRAINT IF EXISTS practice_sessions_user_id_fkey;

-- Make the users table id column match auth.users.id type (UUID)
-- If the table already has UUID type, this won't hurt
ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::UUID;

-- Add foreign key reference to auth.users
ALTER TABLE users ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Recreate foreign key on practice_sessions
ALTER TABLE practice_sessions ADD CONSTRAINT practice_sessions_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- Step 2: Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for users table
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 4: Create RLS policies for practice_sessions table
-- Users can view their own practice sessions
CREATE POLICY "Users can view own practice sessions"
  ON practice_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own practice sessions
CREATE POLICY "Users can insert own practice sessions"
  ON practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own practice sessions
CREATE POLICY "Users can update own practice sessions"
  ON practice_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own practice sessions
CREATE POLICY "Users can delete own practice sessions"
  ON practice_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Create a trigger function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.email, 'user_' || new.id::text),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Add helpful comments
COMMENT ON TABLE users IS 'User profiles linked to Supabase Auth';
COMMENT ON TABLE practice_sessions IS 'Practice session data with RLS enabled';
COMMENT ON POLICY "Users can view own profile" ON users IS 'Users can only see their own profile data';
COMMENT ON POLICY "Users can view own practice sessions" ON practice_sessions IS 'Users can only see their own practice sessions';
