import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/db/prisma'

import { compare } from './lib/encrypt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authConfig } from '@/auth.config'

export const maxAge = 30 * 24 * 60 * 60 // 30 days
const { providers: configProviders, ...otherConfigProperties } = authConfig

/* ========================================================================

======================================================================== */
// The auth.ts file includes everything from auth.config.ts plus any non-edge-compatible
// components like database adapters and credential providers that need database access, etc.

export const { handlers, signIn, signOut, auth } = NextAuth({
  // This stays in auth.ts
  adapter: PrismaAdapter(prisma),

  // This stays in auth.ts
  session: {
    strategy: 'jwt' as const,
    maxAge: maxAge
  },

  providers: [
    ...configProviders,

    // This stays in auth.ts because it implements database access.
    CredentialsProvider({
      name: 'credentials',
      // Brad does this. I don't think it's necessary.
      // credentials: {email: { type: 'email' },password: { type: 'password' }},
      async authorize({ email, password }) {
        ///////////////////////////////////////////////////////////////////////////
        //
        // What happens if the associated authorize() throws an error?
        // A CallbackRouteError is triggered. However, this error does not expose the
        // original message. This behavior is actually intentional in NextAuth.js v5.
        // The CallbackRouteError is a generic error wrapper that does not expose the
        // original error message thrown inside the authorize function. This was introduced
        // to prevent leaking sensitive information to the client, such as specific
        // authentication failure reasons. That said, if you look in the Terminal, you
        // can still see the original error message, which may be useful for debugging..
        //
        //   [auth][cause]: Error: Test throwing errror! You did a bad thing!
        //
        // Returning null in authorize() instead of throwing an error is still a valid approach.
        // In this case, a CredentialsSignin error is generated, but practically there's no difference
        // except now there's not even a specific [auth][cause] message logged in the Terminal console.
        //
        // If you really need the original error message, there are two workarounds for this. We can
        // create a custom error and throw that instead in auth.ts: throw new InvalidLoginError().
        //
        // Aternatively, since 2022 (Node v16), there's an optional cause property on Error. This
        // is usually undefined by default, but it seems that  Auth.js sets a cause of { err, provider },
        // where err is the original error. Thus, we can still get the original error from err.cause.err.message.
        // Note: this approach ONLY is reliable  in Node and not browser javascript.
        //
        ///////////////////////////////////////////////////////////////////////////

        //# I did this previously:
        //# if (!email || !password) { throw new InvalidLoginError() }

        if (!email || !password) {
          throw new Error('Invalid credentials. (1)')
        }

        // Find user in database
        // Should we be try/catch this? Probably not necessary. If an error does occur,
        // a CallbackRouteError will automatically be triggered. However, we can still
        // try/catch it if we want to rethrow something more specific.

        ///////////////////////////////////////////////////////////////////////////
        //
        // In the Code With Antonio tutorial at 2:39:45 he does make a database call inside
        // of authorize(), and his authorize() is inside of auth.config.ts.
        // Is it safe to run Prisma logic in the authorize() and place it all in auth.config.ts?
        //
        // Will this mess up the middleware which runs on the edge?
        // The authorize() function only runs when a user signs in via the Credentials provider.
        // Presumably, the authorize() function is run when the Auth.js server-side signIn() is run.
        // And, ultimately, this all happens within the auth handlers.
        // In other words, the middleware doesn’t directly or indirectly invoke authorize().
        //
        // That said, Claude is adement that it's not safe to put ANY Prisma logic in auth.config.ts.
        //
        //   "The entire authConfig object is evaluated at import time, including any Prisma references in your
        //   CredentialsProvider. Even though the authorize() function itself isn't executed during middleware
        //   execution, the JavaScript runtime still needs to parse and load all the code in the module.
        //   Having Prisma references in that module will cause errors in edge environments.""
        //
        ///////////////////////////////////////////////////////////////////////////
        const user = await prisma.user.findFirst({
          where: {
            email: email
          }
        })

        /* ======================
              Existence Check
        ====================== */

        if (!user || !user.email || !user.password) {
          // return null
          throw new Error('Invalid credentials. (2)')
        }

        /* ======================
        Verification Token Check
        ====================== */
        ///////////////////////////////////////////////////////////////////////////
        //
        // Done in Code With Antonio at 3:19:10 and revisited at 4:04:25.
        // https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s
        // However, he did it in the signIn() callback. It's more appropriate to do it here.
        // Also, there's no need to repeat this logic in a login() server action.
        // If we're using UnverifiedEmailError() then we can obtain the relevant error info
        // from the generated error.
        //
        ///////////////////////////////////////////////////////////////////////////

        // if (!user.emailVerified) {
        //   throw new UnverifiedEmailError()
        // }

        /* ======================
              Password Check
        ====================== */

        const isMatch = await compare(password as string, user.password)
        //! const isMatch = compareSync(password as string, user.password)
        //! Temporary..................................
        //! const isMatch = password === user.password

        // console.log(
        //   '\n\nCredentials inside of authorize..................................'
        // )
        // console.log({ password, userPassword: user.password, isMatch })

        if (!isMatch) {
          // return null
          throw new Error('Invalid credentials. (3)')
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    })
  ],
  ...otherConfigProperties,

  // AI: These should remain in auth.ts. Events often involve database interactions
  //  or other backend logic that may not be edge-compatible, so keeping them in auth.ts
  // ensures they run in a Node.js environment.
  events: {}
})
