# Authentication Setup Guide

This guide explains how to set up authentication for the Shu Ha Ri practice application.

## Prerequisites

1. A Supabase project (create one at https://supabase.com)
2. Environment variables configured in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Database Migration

### Apply the Auth Migration

The migration file `003_add_auth_support.sql` needs to be applied to your Supabase database.

**Option 1: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/003_add_auth_support.sql`
4. Paste and run the SQL

**Option 2: Using Supabase CLI**
```bash
# If you have Supabase CLI installed and linked to your project
supabase db push
```

### What the Migration Does

The migration performs the following:

1. **Links users table to Supabase Auth**
   - Makes `users.id` reference `auth.users.id`
   - Sets up CASCADE delete for data cleanup

2. **Enables Row Level Security (RLS)**
   - Users can only access their own data
   - Policies enforce data isolation at the database level

3. **Creates RLS Policies**
   - Users table: view, insert, update own profile
   - Practice sessions table: full CRUD on own sessions only

4. **Auto-creates User Profiles**
   - Trigger function creates a user profile automatically when someone signs up
   - Uses email as default username

## Email Configuration (Important!)

By default, Supabase requires email confirmation. For development, you can disable this:

1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email Auth", toggle off "Enable email confirmations"
3. For production, keep this enabled and configure your email provider

## Testing the Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
   - You should be redirected to `/auth` (login page)

3. Sign up with a new account:
   - Enter an email and password (min 6 characters)
   - If email confirmation is enabled, check your email
   - If disabled, you'll be signed in immediately

4. After signing in:
   - You should see the home page with a header showing your email
   - You can navigate to practice pages
   - Your progress is now tied to your authenticated user account

5. Test sign out:
   - Click "Sign Out" in the header
   - You should be redirected back to `/auth`

## Migrating Existing Data (Optional)

If you have existing practice data from the old localStorage-based system, it cannot be automatically migrated since there's no way to map anonymous users to authenticated accounts. Users will need to start fresh with authenticated accounts.

## Troubleshooting

### "Policy violation" errors
- Make sure RLS is enabled on both tables
- Verify all policies are created correctly
- Check that the auth trigger function exists

### Users can't sign up
- Check Supabase Dashboard → Authentication → Settings
- Verify email provider is configured (or confirmation is disabled)
- Look at Supabase logs for detailed errors

### Database connection issues
- Verify environment variables are correct
- Check that your Supabase project is not paused
- Test connection using Supabase dashboard

## Security Notes

- Never commit `.env.local` to version control
- The anon key is safe to use client-side (it's restricted by RLS)
- For production, consider adding rate limiting on auth endpoints
- Keep your Supabase project service_role key secret (never use client-side)

## Next Steps

After authentication is working:
- Customize user profiles (add display names, avatars, etc.)
- Add social auth providers (Google, GitHub, etc.)
- Implement password reset functionality
- Add email verification flow for production
