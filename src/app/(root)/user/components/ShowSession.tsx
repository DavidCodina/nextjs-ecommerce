'use client'
import { useSession } from 'next-auth/react'

/* ========================================================================
                                
======================================================================== */

export const ShowSession = () => {
  const { data: session, status /*, update */ } = useSession()

  /* ======================

  ====================== */

  const renderSession = () => {
    if (status === 'loading') {
      return (
        <h3 className='text-center text-3xl font-black text-blue-500'>
          Loading...
        </h3>
      )
    }

    if (status === 'authenticated') {
      return (
        <div className='rounded-lg border border-neutral-400 bg-white p-4 shadow'>
          <h3 className='text-2xl font-black text-blue-500'>
            Session From useSession():
          </h3>
          <pre>
            <code className='text-pink-500'>
              {JSON.stringify(session, null, 2)}
            </code>
          </pre>

          <h3 className='text-2xl font-black text-blue-500'>Status:</h3>

          <p>
            <code>{status}</code>
          </p>
        </div>
      )
    }

    if (status === 'unauthenticated') {
      return (
        <div className='rounded-lg border border-neutral-400 bg-white p-4 shadow'>
          <h3 className='text-2xl font-black text-blue-500'>
            Status: Unauthenticated
          </h3>

          <p>
            <code>{status}</code>
          </p>
        </div>
      )
    }

    return null
  }

  /* ======================

  ====================== */

  return renderSession()
}
