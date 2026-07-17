## Description
The login page has a "Continue with Google" button rendered in `app/blocks/login-page/o-auth-options.tsx`, but it has **no click handler** and no backend integration. The only working auth method is email/password via `supabase.auth.signInWithPassword()`.

## Expected Behavior
Users should be able to sign in using their Google account and GitHub account with a single click, using Supabase's built-in OAuth providers.

## Technical Hints
- Supabase Auth natively supports OAuth — use `supabase.auth.signInWithOAuth({ provider: 'google' })` and `supabase.auth.signInWithOAuth({ provider: 'github' })`
- Configure OAuth providers in your Supabase Dashboard under Authentication → Providers
- The redirect URL should be set to handle the callback (e.g., `/auth/callback`)
- You may need to create a new callback route to handle the OAuth redirect and set session cookies
- Also wire up the signup page (`app/routes/signup-page.tsx`) with the same OAuth options

## Difficulty
**Intermediate-Advanced** (requires Supabase Dashboard configuration + callback route)

## Files to Modify
- `app/blocks/login-page/o-auth-options.tsx` (add onClick handlers)
- `app/blocks/signup-page/o-auth-options.tsx` (same)
- New: `app/routes/auth.callback.tsx` (OAuth redirect handler)
- `app/routes.ts` (register callback route)
