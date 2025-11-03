# Supabase Setup Guide

This guide will help you set up Supabase for persistent data storage in your Shu Ha Ri learning app.

## 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the details:
   - **Name**: shu-ha-ri-learning (or your preferred name)
   - **Database Password**: Create a strong password (save it securely)
   - **Region**: Choose the closest region to your users
5. Click "Create new project" (this takes ~2 minutes)

## 2. Get Your API Credentials

1. Once your project is created, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## 3. Configure Environment Variables

1. Create a `.env.local` file in the root of your project:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 4. Run the Database Migration

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click "New query"
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL editor
6. Click "Run" to execute the migration

This will create:
- **users** table - stores user information
- **practice_sessions** table - tracks progress for each module
- **problem_attempts** table - records every problem attempt with timing data

## 5. Verify the Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see three tables: `users`, `practice_sessions`, and `problem_attempts`
3. The tables should be empty initially

## 6. Test the App Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the addition practice page
3. Solve a few problems
4. Check your Supabase dashboard → **Table Editor** to see the data being stored

## Database Schema

### `users` table
- Stores basic user information
- Can be extended with Supabase Auth later

### `practice_sessions` table
- One row per user per module (e.g., math/addition)
- Tracks overall progress: score, attempts, sets completed, total reps
- Updates after each problem and each completed set

### `problem_attempts` table
- Records every single problem attempt
- Stores problem details, user answer, correctness, and response time
- Used for analytics and identifying weak areas

## Row Level Security (RLS)

Currently, RLS policies allow all operations for simplicity. When you add authentication, you should update the policies to restrict access:

```sql
-- Example: Only allow users to see their own data
DROP POLICY IF EXISTS "Allow all operations on practice_sessions" ON practice_sessions;

CREATE POLICY "Users can only access their own sessions" ON practice_sessions
  FOR ALL USING (auth.uid() = user_id);
```

## Deployment to Vercel

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add both variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Redeploy your app

## Future Enhancements

- **Authentication**: Add Supabase Auth for proper user accounts
- **Real-time**: Use Supabase real-time subscriptions for live leaderboards
- **Analytics Dashboard**: Query `problem_attempts` to show performance trends
- **Backup User**: Create a guest user system for anonymous practice
- **Data Export**: Allow users to download their practice history

## Troubleshooting

### "Failed to fetch" errors
- Verify your Supabase URL and anon key are correct in `.env.local`
- Make sure you restarted your dev server after adding env variables
- Check that your Supabase project is active (not paused)

### Data not saving
- Open browser console to check for errors
- Verify the migration ran successfully in SQL Editor
- Check RLS policies aren't blocking your requests

### Cannot connect to Supabase
- Ensure you're using `NEXT_PUBLIC_` prefix for env variables (required for client-side access)
- Verify your project isn't paused due to inactivity on the free tier
