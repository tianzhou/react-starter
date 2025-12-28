# Google OAuth Authentication Design

**Date:** 2025-12-28
**Status:** Approved

## Overview

Add Google OAuth authentication to the existing auth system, positioned above the GitHub OAuth button. The implementation follows the same pattern as the existing GitHub integration using Better Auth.

## Requirements

- Add "Continue with Google" button above "Continue with GitHub"
- Use existing Better Auth social provider pattern
- Maintain consistent UI/UX with current auth flow
- No changes to email/password authentication

## Design

### 1. Backend Configuration

**File:** `src/lib/auth.ts`

Add Google to the `socialProviders` configuration:

```typescript
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
},
```

**Environment Variables:**
- `GOOGLE_CLIENT_ID` - OAuth client ID from Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - OAuth client secret from Google Cloud Console

Better Auth automatically handles:
- OAuth flow
- Callback URL routing (`/api/auth/callback/google`)
- Session management
- User creation/matching

### 2. Frontend Implementation

**File:** `src/components/AuthLayout.tsx`

**Changes:**

1. **Add Google Icon Component:**
```tsx
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);
```

2. **Add Google Auth Handler:**
```tsx
const handleGoogleAuth = async () => {
  await authClient.signIn.social({
    provider: 'google',
    callbackURL: '/',
  });
};
```

3. **Add Google Button in UI:**
Position before GitHub button in the CardContent:
```tsx
<Button
  onClick={handleGoogleAuth}
  variant="outline"
  className="w-full"
  size="lg"
>
  <GoogleIcon className="mr-2" size={20} />
  Continue with Google
</Button>
```

**Visual Order:**
1. "Continue with Google" button
2. "Continue with GitHub" button
3. "OR" divider
4. Email/password form

### 3. Error Handling

Better Auth provides built-in error handling for OAuth flows:
- Network failures
- User cancellation
- Invalid credentials
- Token exchange errors

Errors surface through the same mechanism as GitHub OAuth (no additional handling needed).

### 4. Testing Checklist

- [ ] Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- [ ] Configure callback URL in Google Cloud Console: `http://localhost:3001/api/auth/callback/google`
- [ ] Test sign-up flow with new Google account
- [ ] Test sign-in flow with existing Google account
- [ ] Verify user session persists after OAuth
- [ ] Test on both `/signin` and `/signup` routes
- [ ] Verify button appears above GitHub button
- [ ] Test error scenarios (cancel OAuth, network failure)

## Implementation Steps

1. Update `src/lib/auth.ts` with Google provider config
2. Add environment variables to `.env` file
3. Update `src/components/AuthLayout.tsx`:
   - Add GoogleIcon component
   - Add handleGoogleAuth handler
   - Add Google button above GitHub button
4. Test authentication flows
5. Verify callback URL configuration in Google Cloud Console

## Security Considerations

- OAuth credentials stored as environment variables (never committed)
- Better Auth handles CSRF protection
- Callback URLs validated by Better Auth
- Session tokens managed securely by Better Auth

## Notes

- Uses multi-color Google brand logo (official colors)
- No changes to existing GitHub or email/password flows
- Follows existing Better Auth patterns for consistency
- Zero impact on existing user sessions
