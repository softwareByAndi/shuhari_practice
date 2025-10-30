# Stage Manager Bug Log

## Date: 2025-10-29

This file documents known bugs and issues in `/lib/stage-manager.ts` that need to be addressed in the future.

## ✅ Fixed Issues

1. **Unsafe Progress Creation** - FIXED
   - Now properly fetches and verifies database response instead of creating local object
   - Handles creation failure gracefully

2. **Type Safety Issues** - FIXED
   - Added proper `StageInfo` interface instead of using `typeof STAGES[0]`
   - Added validation for stage IDs in `getStageInfo` and `getNextStage`
   - Added type checking for stage codes before casting

3. **Input Validation** - FIXED
   - Added validation for inputs to `getProgressToNextStage`
   - Added bounds checking for stage IDs

## 🐛 Critical Issues Remaining

### 1. Incorrect Progress Calculation (Lines 149-152)
**Priority: CRITICAL**
**Current Code:**
```typescript
const progress = (totalReps / requirement) * 100;
```

**Problem:**
- This calculation doesn't account for cumulative requirements from previous stages
- Example: If you're at stage 3 (Kan) which requires 500 total reps:
  - With 250 reps, current formula shows: 250/500 = 50% progress to Kan
  - But you already completed Hatsu (50 reps) and Shu (100 reps)!
  - Actual progress should be: (250-100)/(500-100) = 37.5%

**Correct Formula:**
```typescript
const previousRequirement = await getStageRequirements(topicId, previousStage.code);
const progress = ((totalReps - previousRequirement) / (requirement - previousRequirement)) * 100;
```

**Why Not Fixed:**
- Requires fetching previous stage requirements
- Needs database queries for multiple stages
- Complex edge case handling for first stage
- Should be done with proper testing

## 🔍 Design Issues

### 2. Redundant Passthrough Functions
**Priority: LOW**
**Lines: 68-70, 82-84**

These functions just call their counterparts from `supabase-v2.ts`:
- `getTotalReps` → `getTotalRepsForTopic`
- `checkStageAdvancement` → `checkAndAdvanceStageDB`

**Issues:**
- Creates confusion about which function to use
- Adds unnecessary indirection
- No value added

**Suggested Fix:**
- Either remove these and use the originals directly
- OR add actual logic/validation if keeping them

### 3. Stage Requirements Fetching Pattern
**Priority: MEDIUM**

The current approach fetches stage requirements one at a time. For accurate progress calculation, we need:
- Current stage requirement
- Previous stage requirement (for incremental progress)
- Maybe even all stage requirements for the topic

**Suggested Fix:**
- Create a `getAllStageRequirements(topicId)` function that fetches all at once
- Cache the results to avoid repeated DB calls

### 4. Missing UserID in Progress Validation
**Priority: MEDIUM**

`getProgressToNextStage` can't validate the `totalReps` parameter against actual database values because it doesn't have the userId.

**Suggested Fix:**
- Either pass userId as parameter
- OR trust the caller and remove validation
- OR create a different function that includes userId

### 5. No Stage Transition Validation
**Priority: LOW**

The system doesn't validate if a user can skip stages or must progress sequentially.

**Suggested Fix:**
- Add validation in `checkStageAdvancement` to ensure users can't skip stages
- Define clear rules for stage progression

## 📝 Implementation Notes

### For Progress Calculation Fix:
1. Need to handle edge cases:
   - First stage (no previous requirement)
   - Last stage (100% when reached)
   - Invalid stage IDs

2. Consider caching stage requirements to avoid repeated DB calls

3. Should probably create a dedicated function:
```typescript
async function getIncrementalProgress(
  topicId: number,
  currentStageId: number,
  totalReps: number
): Promise<{
  percentage: number;
  repsInCurrentStage: number;
  repsNeededForNext: number;
}>
```

### For Database Schema Consideration:
- The separation between `Stage` (database) and `StageInfo` (local) types suggests potential schema mismatch
- Consider aligning database schema with application needs
- Maybe store stage requirements in a more accessible format

## 🚀 Future Enhancements

1. **Stage Progression Analytics**
   - Track time spent in each stage
   - Calculate velocity (reps per day)
   - Predict time to next stage

2. **Flexible Stage Requirements**
   - Allow per-user customization of requirements
   - Support different requirement types (time-based, accuracy-based)

3. **Stage Achievement System**
   - Badges or rewards for stage completion
   - Milestone notifications
   - Social sharing of achievements

4. **Performance Optimization**
   - Cache stage requirements per session
   - Batch fetch all stages data on initialization
   - Use Redis or similar for frequently accessed data

## Testing Requirements

When fixing these issues, ensure:
- Unit tests cover all edge cases
- Integration tests verify database interactions
- Progress calculations are tested with various rep counts
- Stage transitions are properly validated