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
  providers: [],

  // AI: callbacks should go into auth.config.ts.
  callbacks: {
    // Runs BEFORE session callback.
    //! Temporary any...
    async jwt(params: any) {
      const { token, user, trigger, session } = params

      ///////////////////////////////////////////////////////////////////////////
      //
      // By default the token will look something like this:
      //
      //   token: {
      //     name: 'John',
      //     email: 'admin@example.com',
      //     picture: undefined,
      //     sub: '5ade9561-2cac-462f-a6ce-2fb185c72ce4'
      //   },
      //
      // And user will look something like this:
      //
      //   user: {
      //     id: '5ade9561-2cac-462f-a6ce-2fb185c72ce4',
      //     name: 'John',
      //     email: 'admin@example.com',
      //     role: 'admin'
      //   },
      //
      ///////////////////////////////////////////////////////////////////////////

      if (user && typeof user === 'object') {
        ///////////////////////////////////////////////////////////////////////////
        //
        // By default the token will look something like this:
        //
        //   token: {
        //     name: 'David',
        //     email: 'david@example.com',
        //     picture: undefined,
        //     sub: '5ade9561-2cac-462f-a6ce-2fb185c72ce4'
        //   }
        //
        // Ultimately, we want to update token so that it includes an id property.
        // Technically, the same as sub, but more semantically correct. Then we also
        // want to add the role property, which will already be on user.
        //
        // By default user will look something like this:
        //
        //   user: {
        //     id: '5ade9561-2cac-462f-a6ce-2fb185c72ce4',
        //     name: 'David',
        //     email: 'david@example.com',
        //     role: 'admin'
        //   },
        //
        ///////////////////////////////////////////////////////////////////////////

        if (token && typeof token === 'object') {
          token.id = user.id
          token.role = user.role
        }

        //! Originally, Brad did this.
        //! However, this would also be problematic inside auth.config.ts.
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
      // Handle session updates
      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name
      }
      return token
    },

    // Runs AFTER jwt callback.
    async session(params) {
      //! Why are we using any here?
      const { session, user, trigger, token }: any = params

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
        session.user.id = token.sub
        session.user.role = token.role
        session.user.name = token.name
      }

      // If there is an update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name
      }
      return session
    }
  }
} satisfies NextAuthConfig
