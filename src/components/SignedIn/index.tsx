'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'

/* ========================================================================

======================================================================== */

export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession()
  return session ? children : null
}
