import type { NextAuthConfig } from 'next-auth'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

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

  providers: [
    ///////////////////////////////////////////////////////////////////////////
    //
    // Go to GitHub --> Settings --> Developer Settings --> OAuth Apps --> New --> New OAuth App.
    // But actually I already had a NextAuth Demo.
    // For Homepage URL use:               http://localhost:3000
    // For Authorization callback URL use: http://localhost:3000/api/auth/callback/github
    // How do we know what the callback should be. Go here to see:
    //
    //   http://localhost:3000/api/auth/providers
    //
    // ⚠️ This will absolutely not work if you push it to production.
    // In practice, we would actually want to create two separate OAuth GitHub applications.
    // One for development and one for production because you can only have one callbackUrl per application.
    // Jack Herrington discusses this at 4:25 here: https://www.youtube.com/watch?v=md65iBX5Gxg
    // Some other OAuth providers may allow you to have more than one callbackUrl.
    //
    //# Note: When you sign in with GitHub, it will add an associated account document.
    //# It will also add a user. When using Prisma, manually deleting a user from Prisma studio would cause
    //# a deletion cascade that would also remove the associated account. However, when
    //# using Mongoose this does NOT happen. This means we need to come up with a solution for this.
    //
    ///////////////////////////////////////////////////////////////////////////
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }),

    ///////////////////////////////////////////////////////////////////////////
    //
    // Next Auth V5 Tutorial: https://www.youtube.com/watch?v=qDRQ2EaWsNM
    // https://authjs.dev/reference/core/providers/google
    // Go to https://console.cloud.google.com
    // 'Create Or Select A Project= --> 'New Project'
    // Then give it a project name ('NextAuth') and click 'Create'
    // Then go to Google's Credentials page and click '+ Create Credentials' --> 'OAuth Client ID'.
    // Then 'Configure Consent Screen' --> check 'External' radio --> click 'Create'.
    // You're then redirected to the App Info screen. Add:
    //
    //   - App Name: 'Demo',
    //   - User support email: 'YOUR_EMAIL_HERE' (I used gmail).
    //   - Developer Contact Info: 'YOUR_EMAIL_HERE' (I used gmail).
    //
    // Then you're on the Scopes page. You don't need to change anything, click "Save And Continue".
    // The you're on the Test users page, click "Save And Continue".
    // Then you'r on the Summary page, click 'Back to Dashboard'.
    // Then click 'Creadentials' --> '+ Create Credentials' --> 'OAuth Client ID' (again!).
    // For 'Application Type' select 'Web Application', and I simply named it 'Web App Demo'
    // The next part is important. In 'Authorized redirect URIs', you have to pass in the following:
    //
    //   http://localhost:3000/api/auth/callback/google
    //
    // This URL will need to change upon deployment. Then click 'Create'.
    // A modal will popup with your credentials. Add these to the .env.
    //
    //   GOOGLE_CLIENT_ID=...
    //   GOOGLE_CLIENT_SECRET=...
    //
    //# How would you handle name/email updates if the user was logged in through
    //# Google provider?
    //
    //# Test what happens if you login with credentials. Then login with Google
    //# such that they're both using same email.
    //
    ///////////////////////////////////////////////////////////////////////////

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
      // profile: (profile, tokens) => { return profile }
    })
  ]
} satisfies NextAuthConfig
