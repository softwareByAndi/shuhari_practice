# Local Mode Configuration

This application supports running in "Local Mode" which allows development and testing without requiring Supabase connections.

## Features

### 1. Local Static Data
- Uses cached JSON files for static data (fields, subjects, topics, stages, difficulty levels)
- No database calls for reference data
- Significantly faster loading times
- Works completely offline

### 2. Local Authentication
- Mock authentication system using browser localStorage
- No Supabase Auth required
- Pre-configured test accounts
- Instant auth operations

## Configuration

Edit `/lib/config.ts` to enable/disable local modes:

```typescript
// Enable local static data (cached JSON files)
export const USE_LOCAL_STATIC_DATA = true;

// Enable local authentication (mock auth)
export const USE_LOCAL_AUTH = true;
```

Or use environment variables:
```bash
# Force local mode for all features
NEXT_PUBLIC_FORCE_LOCAL_MODE=true
```

## Updating Static Data

When database schema or reference data changes, update the local cache:

```bash
# Export latest data from Supabase to local JSON files
npm run export-data
```

This creates/updates files in `/lib/static-data/`:
- `fields.json` - Academic fields
- `subjects.json` - Subjects within fields
- `topics.json` - Topics within subjects
- `stages.json` - Shu-Ha-Ri stages
- `difficulty-levels.json` - Difficulty configurations
- `difficulty-progressions.json` - Stage progression requirements
- `topic-difficulty-options.json` - Topic-specific difficulty mappings
- `all-data.json` - Combined data file
- `export-info.json` - Export metadata and timestamps

## Test Accounts (Local Auth Mode)

When using local authentication, these accounts are available:

| Email | Password | Notes |
|-------|----------|-------|
| test@example.com | password123 | Standard user |
| admin@example.com | admin123 | Admin user |

## Testing Local Mode

Visit `/test-local-auth` to:
- View current configuration
- Test authentication flow
- Verify local mode is working

## Benefits of Local Mode

### Development
- No Supabase setup required
- Faster development cycles
- Works offline
- Predictable test data

### Testing
- Consistent test environment
- Fast test execution
- No database cleanup needed
- Isolated from production

### Performance
- Zero network latency for static data
- Instant auth operations
- Reduced API calls
- Lower bandwidth usage

## Switching to Production Mode

To use Supabase in production:

1. Set environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. Update `/lib/config.ts`:
```typescript
export const USE_LOCAL_STATIC_DATA = false;
export const USE_LOCAL_AUTH = false;
```

3. Deploy with production settings

## Important Notes

- **User data is NOT cached locally** - Sessions and progress always use the database
- **Local auth uses localStorage** - Data persists in browser but not across devices
- **Static data should be refreshed** - Run `npm run export-data` periodically
- **Test accounts are hardcoded** - Only for development, never deploy with local auth enabled

## Troubleshooting

### Data not updating
- Run `npm run export-data` to refresh cached data
- Clear browser cache if auth issues persist
- Check `/lib/config.ts` settings

### Auth not working
- Verify `USE_LOCAL_AUTH` is set correctly
- Check browser console for errors
- Clear localStorage if needed: `localStorage.clear()`

### Mixed mode issues
- Static data and auth can be configured independently
- Ensure Supabase credentials are set even if using local static data
- User sessions always require database access