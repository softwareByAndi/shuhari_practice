# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Run development server (hot reload on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npx tsc --noEmit
```

## High-Level Architecture

### Application Overview
This is a Next.js 16 application implementing the Shu Ha Ri (守破離) learning methodology for educational practice. Currently features single-digit addition with progression through mastery levels.

**Tech Stack:**
- Next.js 16.0.1 with App Router (strict TypeScript)
- React 19.2.0
- Tailwind CSS 4 with PostCSS
- Supabase (PostgreSQL) for data persistence
- ESLint 9 with flat config

### Core Components

**Practice Flow:**
1. `app/page.tsx` - Subject selection landing page
2. `app/practice/math/page.tsx` - Math module selection
3. `app/practice/math/addition/page.tsx` - Main practice component handling:
   - Problem generation (single-digit addition 0+0 to 9+9)
   - Answer submission with keyboard support
   - Visual feedback (green/red for correct/incorrect)
   - Session tracking and statistics
   - Progress persistence to Supabase

**Key Implementation Details:**
- Problems stored as strings in format "a+b"
- Session state persisted after each answer with 3-second debounce
- Response times tracked with outlier filtering (>5x average excluded)
- Automatic progression through 100 problem combinations per set
- Congratulations modal on set completion with statistics

### Database Schema (Supabase)

**users table:**
- `id` (UUID), `username` (TEXT UNIQUE), `created_at`, `updated_at`

**practice_sessions table:**
- `id` (UUID), `user_id` (UUID FK), `subject`, `module`
- `total_reps` (INTEGER), `session_avg_response_time` (INTEGER)
- `current_level` (TEXT): 'shu' | 'ha' | 'ri'
- `last_practiced_at`, `created_at`, `updated_at`
- Multiple sessions per user/module allowed (no UNIQUE constraint)

### Key Implementation Details

**Database Helpers (`lib/supabase.ts`):**
- `getOrCreateUser(username)` - localStorage-based user session
- `createPracticeSession()` - Initialize new practice session
- `updatePracticeSession()` - Debounced session updates
- `getTotalRepsForModule()` - Sum all reps across sessions
- `getLastSessionAvgResponseTime()` - Previous session metrics

**Frontend State Management:**
- Problems generated as shuffled array of 100 combinations
- Keyboard-first interaction (Enter to submit, auto-focus)
- Immediate visual feedback on answers
- Real-time statistics display
- 3-second debounced saves to reduce database writes

**Supabase Integration:**
- Client initialized in `lib/supabase.ts`
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Row-level security policies for user data isolation

### Configuration Notes

**TypeScript:** Strict mode enabled with all strict checks
**ESLint:** Flat config format (`eslint.config.mjs`)
**Tailwind:** Version 4 with @tailwindcss/postcss
**Next.js:** Turbopack enabled for faster builds

### Development Workflow

1. Environment setup: Copy `.env.local.example` to `.env.local` and configure Supabase
2. Database setup: Run migrations in `supabase/migrations/` directory
3. Local development: `npm run dev` with hot reload
4. Type safety: TypeScript strict mode catches errors at compile time
5. Code quality: ESLint configured for Next.js best practices

### Deployment Checklist

- Set environment variables in Vercel dashboard
- Ensure Supabase project is configured and accessible
- Verify database migrations are applied
- Test production build locally with `npm run build && npm start`
