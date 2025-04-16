import type { NextAuthConfig } from 'next-auth'

/* ========================================================================

======================================================================== */
///////////////////////////////////////////////////////////////////////////
//
// The auth.config.ts file is designed to contain only edge-compatible code -
// which means OAuth providers and static configuration that can run in an edge environment.
// In other words, NO PRISMA and NO DATABASE ACCESS.
//
// Because the CredentialsProvider uses database functionality, it is only included in auth.ts.
// My concern is that omitting a provider here and only including it in auth.ts will potentially
// lead to some kind of error or discrepancy. Claude suggests that this is actually the correct
// approach based on the edge compatibility requirements.
//
// Then I asked, "Okay, but if we can safely omit various providers from auth.config.ts, why do we need
// to include any providers at all?"
//
//   Claude Response: In truth, you don't necessarily need to include any providers in auth.config.ts
//   if they aren't required for your middleware functionality. The primary purpose of the split configuration
//   is to isolate edge-compatible code from code that requires Node.js features.
//
// See here for more on Edge Compatibility: https://authjs.dev/guides/edge-compatibility
//
///////////////////////////////////////////////////////////////////////////

export const authConfig = {
  // AI: pages should go in auth.config.ts. The pages configuration is used to
  // define custom routes for authentication flows, and since it's not dependent
  // on database interactions, it fits well in the shared config.

  pages: {
    signIn: '/login',
    error: '/login'
    // This was for Brad's versions
    // signIn: '/sign-in',
    // error: '/sign-in'
  },

  //^ In auth.config.ts - include only edge-compatible providers (OAuth providers)
  providers: []
} satisfies NextAuthConfig
