# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shuhari Practice is a Next.js 16 learning application that implements the Shuhari martial arts mastery principle for educational practice, particularly focused on mathematics. The app generates practice problems and tracks user progress through different stages of mastery.

## Commands

### Development
- `npm run dev` - Start development server with Webpack (default port 3000)
- `npm run build` - Build production version with Webpack
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npm run export-data` - Export static data using `npx tsx scripts/export-static-data.ts`

## Architecture

### Routing Structure
The app uses Next.js App Router with dynamic nested routes:
- `/` - Homepage with field selection grid and recent practice
- `/practice/[field]/[subject]` - Dynamic practice sessions (e.g., `/practice/math/addition`)
- `/auth` - Authentication pages
- `/test` - Test pages for development

### Data Architecture
The application uses a hybrid local/remote data approach:
- **Static Data**: Pre-generated JSON files in `/lib/static-data/` containing fields, subjects, topics, and stages
- **Local Storage**: Session data and progress tracking via `lib/local-session-storage.ts`
- **Supabase**: Remote database for user authentication and persistent data (when enabled)
- **Lookup Tables**: Efficient data access through `lib/local_db_lookup.ts` instead of direct database queries

### State Management
- **AuthContext** (`contexts/AuthContext.tsx`): Manages user authentication state, supporting both local and Supabase providers
- **SessionProvider** (`contexts/SessionProvider.tsx`): Handles practice session state and progress tracking
- Local authentication fallback available when Supabase is not configured

### Problem Generation
The `lib/problem-generator-v3.ts` handles dynamic problem generation with configurable complexity:
- Supports different digit counts and ranges
- Configurable negative numbers and decimals
- Topic-specific equation configurations from `lib/equation-types.ts`

### Component Organization
- `/components` - Shared UI components (Header, ProgressBar, Numpad, etc.)
- `/app/practice/components` - Practice-specific components
- Styling uses Tailwind CSS v4 with PostCSS and module CSS files in `/styles`

## Environment Configuration
Required `.env.local` variables (see `.env.local.example`):
- Supabase connection details (optional - falls back to local mode)
- Authentication providers configuration

## Key Technical Decisions
- Uses React 19.2.0 with server components (`'use server'` directive)
- TypeScript for type safety
- Lodash for utility functions
- Simple-statistics library for analytics
- Local-first approach with optional cloud sync