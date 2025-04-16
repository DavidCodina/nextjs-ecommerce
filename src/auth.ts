import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/db/prisma'

import { compare } from './lib/encrypt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authConfig } from '@/auth.config'

// import { UnverifiedEmailError } from '@/CustomAuthErrors'

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
        // ⚠️ In the Code With Antonio tutorial at 2:39:45 he makes a database call inside
        // of authorize(), inside of CreadentialsProvider, inside of auth.config.ts.
        // Is it safe to run Prisma logic in the authorize() and place it all in auth.config.ts?
        // Will this mess up the middleware which used authConfig and runs on the edge?
        //
        // The authorize() function only runs when a user signs in via the CredentialsProvider.
        // Presumably, the authorize() function is run when the Auth.js server-side signIn() is run.
        // And, ultimately, this all happens within the auth handlers.
        // In other words, the middleware doesn’t directly or indirectly invoke authorize().
        //
        // That said, Claude is adamant that it's not safe to put ANY Prisma logic in auth.config.ts.
        //
        //   "The entire authConfig object is evaluated at import time, including any Prisma references in your
        //   CredentialsProvider. Even though the authorize() function itself isn't executed during middleware
        //   execution, the JavaScript runtime still needs to parse and load all the code in the module.
        //   Having Prisma references in that module will cause errors in edge environments."
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
        //
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

        // ⚠️ If you're using homegrown compare, then make sure to add ENCRYPTION_KEY to Vercel.
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
  ///////////////////////////////////////////////////////////////////////////
  //
  // Sometimes AI says callbacks should go in auth.config.ts.
  // However, I don't think that this is strictly true.
  // First of all, callbacks seem to run after the middleware.
  // Second, we may want datbase logic in callbacks, so it makes sense
  // to put them in auth.ts.
  //
  // Code With Antonio discusses this point at 3:07:45.
  // Here he makes two points:
  //
  //   1. He puts callbacks in auth.ts.
  //   2. He 'believes' that Prisma can, in fact, be used in authorize() in CredentialsProvider,
  //      in auth.config.ts. He explicitly says that the CredentialsProvider doesn't run on the Edge.
  //      This may or may not be true. Again, Claude argues that even having Prisma references in
  //      auth.config.ts could be problematic. It's very unclear. Of course, we could just move
  //      CredentialsProvider into auth.config.ts, and if it ends up causing problems, then
  //      just move it back here.
  //
  ///////////////////////////////////////////////////////////////////////////
  callbacks: {
    // signIn --> jwt --> session
    // eslint-disable-next-line
    async signIn({ user, account, profile, email, credentials }) {
      // Todo: Review what was done in the old version...
      return true
    },
    // Runs BEFORE session callback.
    async jwt(params) {
      const { token, user /* , session, account, profile, trigger, */ } = params

      if (user && typeof user === 'object') {
        // The user { id, email, name, role } will be passed to jwt() on signIn,
        // but will be undefined thereafter.

        ///////////////////////////////////////////////////////////////////////////
        //
        // By default, `token` will look something like this:
        //
        //   token: {
        //     name: 'David',
        //     email: 'david@example.com',
        //     sub: '5ade9561-2cac-462f-a6ce-2fb185c72ce4',
        //     iat: 1744767031,
        //     exp: 1747359031,
        //     jti: '22ca81bc-20ff-49f3-aad8-b39f73035503'
        //   }
        //
        //
        // By default, `user` will look something like this:
        //
        //   user: {
        //     id: '5ade9561-2cac-462f-a6ce-2fb185c72ce4',
        //     name: 'David',
        //     email: 'david@example.com',
        //     role: 'admin'
        //   },
        //
        // Ultimately, we want to update token so that it includes an `id` and `role` properties.
        // Technically `id` is the same as sub, but more semantically correct.
        // Note: All of this works in conjunction with the type augmentations in next-auth.d.ts
        //
        ///////////////////////////////////////////////////////////////////////////

        if (token && typeof token === 'object') {
          // ⚠️ Code With Antionio uses token.sub to connect to the database by id.
          // This is done at 3:05:30 : https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s
          // However, I don't think there's any reason to do this here. We're already
          // connecting to the database in the authorize() function. From there, we can add
          // anything we want to user, then transfer from user to token here.

          token.id = user.id
          token.role = user.role
        }

        //! Originally, Brad did this.
        //! It corresponded to this in the User model: name String @default("NO_NAME")
        //! However, name is already required, so this seems unnecessary.
        //! Also, I removed @default("NO_NAME") from the User model.
        //! If user has no name then use the email
        //! if (user.name === 'NO_NAME') {
        //!   token.name = user.email!.split('@')[0]
        //!   // Update database to reflect the token name
        //!   await prisma.user.update({
        //!     where: { id: user.id },
        //!     data: { name: token.name }
        //!   })
        //! }

        // if (trigger === 'signIn' || trigger === 'signUp') {
        //   const cookiesObject = await cookies()
        //   const sessionCartId = cookiesObject.get('sessionCartId')?.value
        //   if (sessionCartId) {
        //     const sessionCart = await prisma.cart.findFirst({
        //       where: { sessionCartId }
        //     })
        //     if (sessionCart) {
        //       // Delete current user cart
        //       await prisma.cart.deleteMany({
        //         where: { userId: user.id }
        //       })
        //       // Assign new cart
        //       await prisma.cart.update({
        //         where: { id: sessionCart.id },
        //         data: { userId: user.id }
        //       })
        //     }
        //   }
        // }
      }
      //! Brad does this. I'm just not sure if I need it.
      //! if (session?.user.name && trigger === 'update') {
      //!  token.name = session.user.name
      //! }
      return token
    },

    // Runs AFTER jwt callback.
    async session(params) {
      const { session, token /* user, trigger, */ } = params

      ///////////////////////////////////////////////////////////////////////////
      //
      // By default session will look something like this:
      //
      //   session: {
      //     user: { name: 'David', email: 'david@example.com', image: undefined },
      //     expires: '2025-05-14T19:55:55.932Z'
      //   },
      //
      // The goal here is to add id, role to the user.
      // I think name is already included, but Brad also resets name.
      //
      ///////////////////////////////////////////////////////////////////////////

      if (session && typeof session === 'object' && 'user' in session) {
        // Set the user ID from the token

        if (token.id && typeof token.id === 'string') {
          session.user.id = token.id
        } else if (token.sub && typeof token.sub === 'string') {
          session.user.id = token.sub
        }

        if (token.role && typeof token.role === 'string') {
          session.user.role = token.role
        }

        //  user.name and user.email should already be in session.user by default.
      }

      //! Brad does this. I'm just not sure if I need it.
      //! If there is an update, set the user name
      //! if (trigger === 'update') {
      //!   session.user.name = user.name
      //! }
      return session
    }
  },
  ...otherConfigProperties,

  // AI: These should remain in auth.ts. Events often involve database interactions
  //  or other backend logic that may not be edge-compatible, so keeping them in auth.ts
  // ensures they run in a Node.js environment.
  events: {}
})
