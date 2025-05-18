'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'

/* ========================================================================

======================================================================== */

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession()
  return !session ? children : null
}
