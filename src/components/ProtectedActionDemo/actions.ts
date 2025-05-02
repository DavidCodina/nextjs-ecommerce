'use server'

import { auth } from '@/auth'

type ProtectedActionData = {
  data: any
  message: string
  success: boolean
}

/* ========================================================================

======================================================================== */

export const protectedAction = async (): Promise<ProtectedActionData> => {
  const session = await auth()

  if (!session) {
    return {
      data: null,
      message: 'Unauthorized. User must be authenticated.',
      success: false
    }
  }

  return {
    data: { id: 'abc123', message: "You've accessed the protected action!" },
    message: 'Success.',
    success: true
  }
}
