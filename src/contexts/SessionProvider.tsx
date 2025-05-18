'use client'

import {
  SessionProvider as NextAuthSessionProvider,
  SessionProviderProps
} from 'next-auth/react'

import { useAppContextSelector } from '@/contexts'

/* ========================================================================

======================================================================== */
///////////////////////////////////////////////////////////////////////////
//
// https://authjs.dev/getting-started/migrating-to-v5
// The v5 docs have very little information on next-auth/react.
//
// Generally, they seem to be encouraging people to only use the server-side auth().
//
//   // https://authjs.dev/getting-started/migrating-to-v5
//   Use auth() instead of getServerSession, getSession, withAuth, getToken, and useSession (Read more)
//
//   // https://authjs.dev/getting-started/migrating-to-v5#authenticating-server-side
//   Auth.js has had a few different ways to authenticate server-side in the past, so we’ve tried to simplify
//   this as much as possible. Now that Next.js components are server-first by default, and thanks to the
//   investment in using standard Web APIs, we were able to simplify the authentication process to a single
//   auth() function call in most cases.
//
// If you want to learn about the client API, you may have to go back to the
// v4 docs: https://next-auth.js.org/getting-started/client
//
///////////////////////////////////////////////////////////////////////////

export const SessionProvider = ({
  children,
  ...otherProps
}: SessionProviderProps) => {
  const sessionKey = useAppContextSelector('sessionKey')
  /* ======================
          return
  ====================== */

  return (
    <NextAuthSessionProvider {...otherProps} key={sessionKey}>
      {children}
    </NextAuthSessionProvider>
  )
}
