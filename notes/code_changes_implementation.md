# Code Changes Implementation Guide

## Overview
This document outlines the specific code changes needed to migrate from the 3-stage system to the 7-stage architecture. The new database tables are already in place.

## Current → New Architecture Mapping

### Data Model Changes
| Old System | New System |
|------------|------------|
| `practice_sessions` table | `session` table |
| `subject + module` combo | `field → subject → topic` hierarchy |
| 3 levels: shu, ha, ri | 7 stages: hatsu, shu, kan, ha, toi, ri, ku |
| Hardcoded 1000 reps | Dynamic thresholds from `difficulty_progression` |
| `digits` parameter (1,2,3) | `difficulty_level_id` (101-105) |
| Only avg response time | Both avg and median response time |
| No accuracy tracking | Accuracy percentage tracked |

### URL Structure Changes
| Old URL | New URL |
|---------|---------|
| `/practice/math` | `/practice/math` (subjects within math) |
| `/practice/math/equations/[type]` | `/practice/math/[subject]` (topics within subject) |
| `/practice/math/equations/[type]/practice?digits=X` | `/practice/math/[subject]/[topic]?stage=X&difficulty=Y` |

## File-by-File Changes Required

### 1. Create New Type Definitions
**File:** `lib/types/database.ts` (NEW)
- Create TypeScript interfaces for all new tables
- Export types for use throughout the app

### 2. Database Access Layer
**File:** `lib/supabase.ts` → `lib/supabase-v2.ts` (NEW)
- Replace all old functions with new ones
- Key functions needed:
  - `getActiveFields()` - Get math, science, etc.
  - `getSubjectsForField()` - Get arithmetic, algebra, etc.
  - `getTopicsForSubject()` - Get addition, subtraction, etc.
  - `getUserProgress()` - Get user's current stage for a topic
  - `createSession()` - Start a new practice session
  - `updateSession()` - Update with stats
  - `checkAndAdvanceStage()` - Auto-advance when requirements met

### 3. Problem Generator
**File:** `lib/problem-generator.ts`
- Change function signature from `digits` to `stage + difficulty`
- Adjust problem complexity based on stage (1-7) and difficulty (101-105)
- Stage 1-3: Single digit focus
- Stage 4-5: Multi-digit, introduce negatives
- Stage 6-7: Complex problems, decimals

### 4. Home Page
**File:** `app/page.tsx`
- Currently: Hardcoded "Mathematics" card
- Change to: Fetch fields from database, display active ones
- Update navigation to `/practice/[field]`

### 5. Math Module Selection
**File:** `app/practice/math/page.tsx`
- Currently: Lists equation types directly
- Change to:
  - Fetch subjects for math field
  - Display subjects (Arithmetic, Algebra, Geometry)
  - Navigate to `/practice/math/[subject]`

### 6. Subject Page (NEW)
**File:** `app/practice/math/[subject]/page.tsx` (NEW)
- Fetch topics for the subject
- Show user's progress for each topic
- Display current stage and progress bar
- Navigate to practice page

### 7. Practice Component
**File:** `app/practice/math/[subject]/[topic]/page.tsx` (NEW)
Replace: `app/practice/math/equations/[type]/practice/page.tsx`
- Accept topic_id, stage_id, difficulty_level_id
- Track median response time (not just average)
- Track accuracy percentage
- Auto-advance stages based on `difficulty_progression` thresholds
- Show stage progress bar
- Different problem sets per stage

### 8. Recent Practice Component
**File:** `components/RecentPractice.tsx`
- Currently: Groups by module name
- Change to: Group by topic, show stage progress
- Display stage name instead of shu/ha/ri
- Update progress calculation for 7 stages

### 9. Remove Old Structure
**Delete:** `app/practice/math/equations/` directory entirely
- No longer needed with new routing

## Implementation Order

1. **Create type definitions** - Foundation for everything else
2. **Create supabase-v2.ts** - New database access layer
3. **Update problem generator** - Stage-based generation
4. **Update navigation flow** - Home → Field → Subject → Topic
5. **Create new practice component** - 7-stage progression
6. **Update RecentPractice** - New progress display
7. **Clean up** - Remove old files

## Key Code Snippets

### Stage Mapping
```typescript
const STAGE_NAMES = {
  1: 'Hatsu (初) - Begin',
  2: 'Shu (守) - Obey',
  3: 'Kan (鑑) - Mirror',
  4: 'Ha (破) - Break',
  5: 'Toi (問) - Question',
  6: 'Ri (離) - Leave',
  7: 'Ku (空) - Void'
};
```

### Difficulty Mapping
```typescript
const DIFFICULTY_LEVELS = {
  101: { name: 'Seedling', icon: '🌱' },
  102: { name: 'Sapling', icon: '🌿' },
  103: { name: 'Bamboo', icon: '🎋' },
  104: { name: 'Cedar', icon: '🌲' },
  105: { name: 'Ancient Oak', icon: '🌳' }
};
```

### Module to Topic ID Mapping
```typescript
const MODULE_TO_TOPIC_ID = {
  'addition': 1,
  'subtraction': 2,
  'multiplication': 3,
  'division': 4,
  'modulus': 5,
  'exponents': 6,
  'square-roots': 7,
  'negatives-addition': 8,
  'negatives-subtraction': 9
};
```

## Testing Checklist

After implementing each component:

- [ ] Fields load from database
- [ ] Subjects display correctly
- [ ] Topics show with progress
- [ ] Practice sessions create properly
- [ ] Problems generate at correct difficulty
- [ ] Stage advancement works
- [ ] Progress persists correctly
- [ ] Recent practice shows new format
- [ ] Old URLs redirect properly

## Notes

- Keep the auth system unchanged
- Maintain the same Supabase connection
- Use the same UI components (just update data)
- Focus on functionality first, polish UI later