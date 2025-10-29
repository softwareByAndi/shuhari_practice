# Anonymous Mode Implementation

This document explains the anonymous mode feature that allows users to practice without signing in.

## Overview

The app now supports **anonymous practice mode** where users can use all practice features without creating an account. Their progress simply won't be saved to the database.

## Benefits

1. **Zero friction onboarding** - Users can try the app immediately
2. **No forced signup** - Users decide when they want to save progress
3. **Full functionality** - All practice features work in anonymous mode
4. **Clear communication** - Users know their progress isn't being saved
5. **Easy conversion** - Simple path to create account and start tracking

## Implementation Details

### What Changed

#### 1. Removed Protected Routes
- Practice pages no longer require authentication
- Users can access any practice module without signing in
- `ProtectedRoute` component is no longer used

#### 2. Optional User Context
- All practice pages check `if (user?.id)` before saving
- Database operations only happen for authenticated users
- Anonymous users skip all database writes

#### 3. User Interface Indicators

**Anonymous User Banner** (on practice pages):
```tsx
{!user && (
  <div className="bg-blue-600 text-white px-4 py-3 text-center">
    <p className="text-sm">
      You're practicing anonymously. Progress won't be saved.{' '}
      <a href="/auth" className="underline font-semibold">Sign in</a>
      {' '}to track your progress!
    </p>
  </div>
)}
```

**Header Navigation**:
- Anonymous users: Shows "Sign In" button
- Authenticated users: Shows email + "Sign Out" button

#### 4. Conditional Data Persistence

**Practice Sessions** - Only created for authenticated users:
```tsx
if (!sessionId && user?.id) {
  const session = await createPracticeSession(user.id, 'math', moduleName);
  // ... save progress
}
```

**Stats Loading** - Only attempted for authenticated users:
```tsx
if (user?.id) {
  const totalReps = await getTotalRepsForModule(user.id, 'math', 'addition');
  setAllTimeReps(totalReps);
}
```

**Save Indicators** - Only shown for authenticated users:
```tsx
{user && saveStatus !== 'idle' && (
  <div className="fixed top-4 right-4">
    {/* Save status indicator */}
  </div>
)}
```

## User Flows

### Anonymous Practice Flow
1. User lands on home page (no login required)
2. Clicks on any practice module
3. Sees banner: "You're practicing anonymously"
4. Practices problems normally
5. Stats show 0 because nothing is saved
6. Can click "Sign in" at any time to create account

### Conversion Flow
1. Anonymous user clicks "Sign in" link
2. Creates account on `/auth` page
3. Returns to home page (now authenticated)
4. Navigates back to practice
5. Banner disappears
6. Progress now being saved automatically

## Technical Considerations

### Database Security (RLS)
- Row Level Security (RLS) prevents anonymous users from seeing data
- `getRecentModulesWithHistory()` returns empty array for anonymous users
- No policy violations - anonymous users simply have no rows visible

### State Management
- `user` from `useAuth()` is `null` for anonymous users
- All database operations check `user?.id` before executing
- Loading states handle both authenticated and anonymous cases

### Performance
- Anonymous mode is actually faster (no database writes)
- No network overhead for saves
- Instant problem generation and feedback

## Files Modified

### Core Changes
- `app/practice/math/addition/page.tsx` - Made auth optional, added banner
- `app/practice/math/equations/[type]/practice/page.tsx` - Same changes
- `components/Header.tsx` - Show "Sign In" button for anonymous users
- `AUTH_SETUP.md` - Updated documentation

### Not Changed
- `lib/supabase.ts` - No changes needed (already handles missing user)
- `contexts/AuthContext.tsx` - Already supports null user state
- Database migrations - RLS handles anonymous users automatically

## Testing Checklist

- [ ] Can access home page without signing in
- [ ] Can start practice without authentication
- [ ] See anonymous banner on practice pages
- [ ] Problems load and work correctly
- [ ] Stats show 0 for anonymous users
- [ ] "Sign In" button visible in header
- [ ] Clicking "Sign in" goes to auth page
- [ ] After signing in, banner disappears
- [ ] Progress saves correctly when authenticated
- [ ] Sign out works and reverts to anonymous mode

## Future Enhancements

Possible improvements:
1. **Save to localStorage** - Store anonymous progress locally, offer to import on signup
2. **Guest accounts** - Create temporary accounts that can be "claimed" later
3. **Progress preview** - Show what stats would look like if they signed up
4. **Exit intent modal** - Prompt to save progress when leaving
5. **Social proof** - Show how many users are tracking progress
