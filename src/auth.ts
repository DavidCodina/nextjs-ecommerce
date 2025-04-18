import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'

import { prisma } from '@/db/prisma'
import { compare } from './lib/encrypt'
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
    ///////////////////////////////////////////////////////////////////////////
    //
    // Choose how you want to save the user session.
    // The default is "jwt", an encrypted JWT stored in the session cookie.
    // If you use an `adapter` however, we default it to "database" instead.
    // You can still force a JWT session by explicitly defining "jwt".
    // When using "database", the session cookie will only contain a `sessionToken` value,
    // which is used to look up the session in the database.
    //
    // https://authjs.dev/guides/upgrade-to-v5#edge-compatibility
    // NextAuth.js supports two session strategies. When you are using an adapter, you can choose
    // to save the session data into a database. Unless your database and its adapter is compatible
    // with the Edge runtime/infrastructure, you will not be able to use a "database" session strategy.
    //
    // Note that the above documentation link goes on to explain how you can use the database strategy
    // even if your ORM does not support the Edge runtime. I think this means I should be able to
    // switch to "database".
    //
    // UnsupportedStrategy: Signing in with credentials only supported if JWT strategy is enabled
    //
    // Note: Even when using Google OAuth, NextAuth's jwt() callback still runs.
    // NextAuth's JWT strategy is independent of the authentication
    // provider. When you're using NextAuth with OAuth providers like Google,
    // NextAuth still utilizes the JWT callback to store session information.
    //
    ///////////////////////////////////////////////////////////////////////////
    strategy: 'jwt' as const, //  "jwt" | "database" | undefined;

    ///////////////////////////////////////////////////////////////////////////
    //
    //  maxAge: How long in seconds until an idle session expires and is no longer valid.
    // It defaults to 30 days: 30 * 24 * 60 * 60,
    //
    // AI Prompt: I set maxAge to 60 (i.e., one minute), but it keeps changing. In other words, every time I
    // get the session from the server, the new expiration is one minute from now. This is unintended.
    // Why is this happening?
    //
    //   This behavior is actually expected and is part of how NextAuth.js manages sessions. When you set session.maxAge to 60 seconds,
    //   it means that the session will be valid for 60 seconds from the time of the last request.
    //
    //   Every time a request is made to the server within this 60-second window, the session expiration time is reset to 60 seconds
    //   from that request time. This is why you’re seeing the session expiration time always being one minute from the current time,
    //   as long as requests are being made within each minute.
    //
    //   This design helps keep sessions active for users who are actively interacting with the application, while allowing sessions to expire
    //   quickly once the user becomes inactive. If you want the session to last for a fixed duration regardless of user activity, you would need
    //   to implement a different session management strategy. However, please note that allowing sessions to remain valid without activity can
    //   have security implications. It's generally recommended to let sessions expire after a period of inactivity to reduce the risk of session hijacking.
    //
    //   If you want to change this behavior, you might need to modify your session management strategy or consider using a different library that supports
    //   fixed-duration sessions. Always remember to consider the security implications of any changes you make to session management.
    //
    // Todo: Read these
    //
    // 1. https://stackoverflow.com/questions/67490767/how-to-configure-clientmaxage-keepalive-with-refresh-tokens-next-auth
    // 2. https://stackoverflow.com/questions/52766797/express-session-cookie-maxage-property-refreshes-on-request
    // 3. https://stackoverflow.com/questions/77073000/how-to-set-session-maxage-dynamically-in-nextjs-using-next-auth
    //
    // If you want the session to expire regardless of activity, you would need to implement that logic yourself,
    // as it’s not a built-in feature of NextAuth.js. For example, you could store a timestamp in the session when it’s
    // created, and then check this timestamp against the current time on each request. If the difference is greater than
    // your desired max age, you could invalidate the session. However, this would require a good understanding of how
    // sessions work in NextAuth.js and careful testing to ensure it behaves as expected.
    //
    // Refetch Interval: The refetchInterval option in the SessionProvider could also affect session expiration.
    // As per the NextAuth.js documentation, the value for refetchInterval should always be lower than the value of
    // the session maxAge session option1.
    //
    ///////////////////////////////////////////////////////////////////////////
    maxAge: maxAge
  },

  providers: [
    ...configProviders,

    // This stays in auth.ts because it implements database access.
    // https://authjs.dev/reference/core/providers/credentials
    // https://authjs.dev/getting-started/providers/credentials-tutorial
    CredentialsProvider({
      name: 'credentials',
      ///////////////////////////////////////////////////////////////////////////
      //
      // Explicitly defining the credentials property in CredentialsProvider is not strictly necessary for NextAuth v5.
      // The credentials property is mainly useful when you want NextAuth to generate built-in UI fields for collecting
      // user input directly within the sign-in form. If you omit it, NextAuth will still work, assuming your authentication
      // logic correctly extracts the email and password from the request during the authorization callback.
      //
      ///////////////////////////////////////////////////////////////////////////

      // ⚠️ credentials: {email: { type: 'email' },password: { type: 'password' }},
      async authorize({ email, password }) {
        ///////////////////////////////////////////////////////////////////////////
        //
        // Any logic that exists in a login server action must be duplicated here.
        // Why? Because someone could be accessing the signIn URL directly:
        // "signinUrl": "http://localhost:3000/api/auth/signin/credentials"
        // This point is emphasized here at 2:38:45 :
        // https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s
        //
        /////////////////////////
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

        if (!email || !password) {
          // Or do: throw new InvalidLoginError()
          throw new Error('Invalid credentials. (1)')
        }

        ///////////////////////////////////////////////////////////////////////////
        //
        // ⚠️ In the Code With Antonio tutorial at 2:39:45 he makes a database call inside
        // of authorize(), inside of CredentialsProvider, inside of auth.config.ts.
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

        // Should we try/catch this? No. If an error occurs, a CallbackRouteError
        // will automatically be triggered. However, we can still
        // try/catch it if we want to rethrow something more specific.
        const user = await prisma.user.findFirst({
          where: {
            email: email
          }
        })

        /* ======================
              Existence Check
        ====================== */

        if (
          !user ||
          typeof user !== 'object' ||
          !user.email ||
          typeof user.email !== 'string' ||
          !user.password ||
          typeof user.password !== 'string'
        ) {
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

        // ⚠️ If you're using homegrown compare(), then make sure to add ENCRYPTION_KEY to Vercel.
        const isMatch = await compare(password as string, user.password)

        if (!isMatch) {
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
  // However, I don't think this is strictly true. First of all,
  //  callbacks seem to run after the middleware.  Second, we may want
  // datbase logic in callbacks, so it makes sense to put them in auth.ts.
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
      ///////////////////////////////////////////////////////////////////////////
      //
      // The very first time a user signs in with an OAuth provider, the user object will be limited:
      //
      //  {
      //     id: '5c6284cf-1212-4707-8bbc-eccad881d832',
      //     name: 'David Codina',
      //     email: 'codinadavid970@gmail.com',
      //     image: 'https://lh3.googleusercontent.com/a/ACg8ocIpUAcHyTlIZCXikgO-0LzbBidj5E8WAGfHH3t9ckNUDpHDSQ=s96-c'
      //   }
      //
      // However, by the time control moves to the jwt() callback, the user object will have all data from
      // the newly created user in the database.
      //
      // Subsequently, when signing in with OAuth providers like Google or GitHub, the user will contain
      // the ENTIRE user object from the database.
      //
      //
      // The default behavior for the OAuth
      // providers seems to be that they internally get the user, so no need to call the
      // database here. Everything you need should already be in the user object.
      //
      /////////////////////////
      //
      // This is the data returned from a google signIn:
      //
      //   user: {
      //     id: 'd0ac6fac-acfa-4f3b-8c2a-4baea144a419',
      //     name: 'David Codina',
      //     email: 'codinadavid123@gmail.com',
      //     emailVerified: null,
      //     image: 'https://lh3.googleusercontent.com/a/ACg8ocIpUAcHyTlIZCXikgO-0LzbBidj5E8WAGfHH3t9ckNUDpHDSQ=s96-c',
      //     password: null,
      //     role: 'user',
      //     address: null,
      //     paymentMethod: null,
      //     createdAt: 2025-04-16T22:47:36.675Z,
      //     updatedAt: 2025-04-16T22:47:36.675Z
      //   }
      //   account: { access_token, expires_in, scope, token_type, id_token, expires_at, provider: 'google', type, providerAccountId }
      //   profile: { sub, name, given_name (first), family_name (last), picture, iat, exp, etc. }
      //   email: undefined
      //   credentials: undefined
      //
      // Note that email is undefined. However, user.name and user.email are populated.
      // Presumably, these are extracted from the profile object.
      // The user.id is also very useful. It appears to be extracted from profile.sub
      // For the moment, those are the main things that we want.
      //
      // From that data we can then check the database for a user that matches the email.
      // If none is found, we want to create one. But actually, NextAuth will automatically,
      // create a new user with that id, name, email, password, image, password, etc.
      //
      // This is not happening through the register() server action. It's actually a
      // consequence of the PrismaAdapter.
      //
      //   1. User Authentication: When a user signs in for the first time using Google
      //   (or any other OAuth provider), NextAuth.js handles the authentication process with the provider.
      //
      //   2. User Creation: If the user is authenticated successfully and is signing in for the first time,
      //   the *Adapter comes into play. The adapter is responsible for creating a new user in the database.
      //
      //   3. Session Management: The *Adapter also manages sessions. When the same user logs in again, the adapter
      //   fetches the user’s information from the database.
      //
      //   4. Linking OAuth Accounts: If users are logging in through OAuth providers (like Google), the adapter
      //   links these OAuth accounts to a user account.
      //
      // The user object in the signIn callback can change over time in NextAuth.js.
      // When a user registers for the first time using an OAuth provider like GitHub,
      // the user object contains information provided by GitHub. This typically includes
      // fields such as id, name, email, and image. After the initial registration, when the
      // user signs back in, NextAuth.js retrieves the ENTIRE user object from your database.
      // With a Credentials sign in, the user object is always whatever is returned from authorize().
      //
      // Learn more:
      //
      //   https://stackoverflow.com/questions/76678908/what-is-the-use-of-adapters-in-nextauth
      //   https://stackoverflow.com/questions/76771833/how-to-use-prisma-adapter-next-auth-in-route-handlers
      //
      ///////////////////////////////////////////////////////////////////////////

      return true
    },

    // Runs BEFORE session callback: signIn --> jwt --> session
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

    // Runs AFTER jwt callback: signIn --> jwt --> session
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
  // or other backend logic that may not be edge-compatible, so keeping them in auth.ts
  // ensures they run in a Node.js environment.

  // Account linking is discussed in Code With Antonio at 3:33:30.
  // https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s

  // This is used specifically for users that register through the Credentials provider.
  // We want to verify them to protect against spam emails.
  events: {
    ///////////////////////////////////////////////////////////////////////////
    //
    // See Code With Antonio at 3:34:15 : https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s
    //
    // This event handler will fire when a user registers for the FIRST TIME using an OAuth provider.
    // It is not fired when a user registers through the Credentials provider:
    //
    //   "Sent when an account in a given provider is linked to a user in our user database. For example,
    //   when a user signs up with Twitter or when an existing user links their Google account."
    //
    // OAuth providers like Google and GitHub already do email verification on their own, so we don't
    // need to verify again. Instead, just add a new Date().
    //
    ///////////////////////////////////////////////////////////////////////////

    async linkAccount(message) {
      const { user } = message

      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  }
})
