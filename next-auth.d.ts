// The import statements are essential even though we're not directly using the
// imported values. When you perform module augmentation (extending existing types
// using declare module), TypeScript needs  to first "load" or reference the
// original module before it can augment it.
import _NextAuth from 'next-auth'
import { JWT as _JWT } from 'next-auth/jwt'
// import { /* type DefaultSession, */ type User as DefaultUser } from 'next-auth'

/* ========================================================================

======================================================================== */
// 👍🏻 Docs: https://authjs.dev/getting-started/typescript
// This has the most up to date information.

// See Code With Antonio at 3:08:00, 3:13:45: https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s
// That said, he really struggled with implementing module augmentation, and I wouldn't follow
// what he does there.

// See also at 1:24:00 : https://www.youtube.com/watch?v=Xa73Xr8PM2k

// Todo: Review actual docs. I'm not exactly doing this the same way as they did.
declare module 'next-auth' {
  // This is exactly the same as the User/DefaultUser.
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }

  interface Session {
    user: User
  }
}

///////////////////////////////////////////////////////////////////////////
//
// We can also modify the JWT interface as seen here at 1:29:40
// https://www.youtube.com/watch?v=Xa73Xr8PM2k
//
//   export interface JWT extends Record<string, unknown>, DefaultJWT {}
//
//   export interface DefaultJWT extends Record<string, unknown> {
//     name?: string | null
//     email?: string | null
//     picture?: string | null
//     sub?: string
//     iat?: number
//     exp?: number
//     jti?: string
//   }
//
///////////////////////////////////////////////////////////////////////////

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
  }
}
