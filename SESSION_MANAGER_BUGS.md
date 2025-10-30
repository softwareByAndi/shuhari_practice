# Session Manager Bug Log

## Date: 2025-10-29

This file documents known bugs and issues in `/lib/session-manager.ts` that need to be addressed in the future.

## ✅ Fixed Issues

1. **Wrong updateSessionDB signature** - FIXED
   - Removed incorrect third boolean parameter for debouncing
   - updateSessionDB handles debouncing internally

2. **Session state recovery** - PARTIALLY FIXED
   - Added `recoverSessionState` function to restore state from database after reload
   - Can recover totalReps and incorrectAnswers from database
   - NOTE: Individual response times cannot be recovered (see issue #1 below)

3. **Improved outlier detection** - FIXED
   - Replaced hardcoded 5x multiplier with Median Absolute Deviation (MAD) approach
   - More robust against outliers using modified Z-score
   - Prevents issue where slow first response would reject normal responses

## 🐛 Remaining Issues to Address

### 1. Response times not persisted to database
**Priority: HIGH**
- Individual response times are only kept in memory
- Database only stores aggregated stats (avg_response_time, median_response_time)
- On page reload, detailed timing data is lost
- **Suggested Fix**: Add a `response_times` JSONB column to the session table to persist the array

### 2. Memory leak potential
**Priority: MEDIUM**
- The `sessionStates` Map only cleans up in `completeSession`
- If session errors out or user closes browser mid-session, memory is never freed
- **Suggested Fix**:
  - Add a periodic cleanup task (e.g., every hour)
  - Remove sessions older than 24 hours from memory
  - Add cleanup on session timeout

### 3. No force-save option for session completion
**Priority: MEDIUM**
- `updateSessionDB` always uses 3-second debouncing
- When completing a session, we want immediate save but API doesn't support it
- **Suggested Fix**: Modify `updateSessionDB` in supabase-v2.ts to accept an optional `immediate` flag

### 4. Race condition in state updates
**Priority: LOW**
- Rapid successive calls to `submitAnswer` could cause race conditions
- Map operations aren't atomic and state updates aren't protected
- **Suggested Fix**:
  - Add mutex/locking mechanism for state updates
  - Or use a queue system for processing answers sequentially

### 5. No session expiration handling
**Priority: LOW**
- Sessions remain "active" indefinitely
- Old abandoned sessions aren't marked as complete
- **Suggested Fix**:
  - Add `last_updated` tracking
  - Auto-complete sessions after 30 minutes of inactivity

### 6. Limited error recovery
**Priority: LOW**
- If database operations fail, no retry mechanism
- State could become inconsistent between memory and database
- **Suggested Fix**:
  - Add retry logic with exponential backoff
  - Add state validation/reconciliation

## 📝 Future Enhancements

1. **Session Analytics**
   - Track problem-by-problem performance
   - Store which problems were answered correctly/incorrectly
   - Time per problem breakdown

2. **Offline Support**
   - Queue database updates when offline
   - Sync when connection restored
   - Use IndexedDB for local persistence

3. **Performance Optimization**
   - Batch database updates for multiple answers
   - Use Web Workers for stats calculations
   - Implement connection pooling

## Implementation Notes

When fixing these issues, ensure:
- Backward compatibility with existing sessions
- Database migrations are properly versioned
- Unit tests cover edge cases
- Error handling doesn't break user experience