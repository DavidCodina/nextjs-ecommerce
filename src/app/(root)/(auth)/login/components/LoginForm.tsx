'use client'

import { Fragment, useState, useEffect /*, useRef */ } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { /* useRouter, */ useSearchParams } from 'next/navigation'
// import Link from 'next/link'
//# import { signIn /* , getSession */ } from 'next-auth/react'

import { DEFAULT_LOGIN_REDIRECT, publicRoutes } from 'routes' // i.e., '/user'
import { login } from '../actions'
import { Button, Input } from '@/components'

/* ========================================================================

======================================================================== */

export const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')
  const errorCode = searchParams?.get('code')
  const callbackUrl = searchParams?.get('callbackUrl')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false) //# Change to status, setStatus

  const isPublicRoute = publicRoutes.includes(callbackUrl || '')

  /* ======================
        useEffect()
  ====================== */
  // This useEffect checks for a URL search parameter of 'error' when the component mounts.

  useEffect(() => {
    //# Do we need this???
    // if (firstRenderRef.current !== true) {
    //   return
    // }
    // firstRenderRef.current = false

    ///////////////////////////////////////////////////////////////////////////
    //
    // This error could result from a user having initially registered through the
    // Credentials provider, then accidentally trying to log in through the
    // Google provider (or some other provider that is already using that same email).
    // The fact that the error will be 'OAuthAccountNotLinked' is kind of confusing.
    // Here's how AI explains it:
    //
    //   The ‘OAuthAccountNotLinked’ error in a Next.js application using NextAuth typically occurs
    //   when a user tries to log in with an OAuth provider (like Google or GitHub), but the account
    //   they’re trying to use isn’t linked to any existing account in your application’s database.
    //
    //   This could happen in a scenario where a user has previously signed up using their email and password
    //   (credentials provider), and later tries to sign in using an OAuth provider with the same email. If
    //   the OAuth account isn’t linked to the existing account created with the credentials provider, NextAuth
    //   will throw the ‘OAuthAccountNotLinked’ error.
    //
    // Normally, when a user registers through an OAuth provider, a record is created in the accounts table
    // that has userId foreign key. ‘OAuthAccountNotLinked’ is essentially saying,
    //
    //   "We acknowledge that you just tried to log in with an OAuth provider. We can see that there's a
    //   user with that email, but for some reason it has no associated record in the Account table.
    //   Consequently, we're going to throw an error!"
    //
    // And the logical conclusion that we can make is that the email exists in the database because it
    // is already being used by some other provider - most likely (but not necessarily) the Credentials provider.
    //
    // The toast message used here is the same one that is used by the default NextAuth
    // '/api/auth/signin?error=OAuthAccountNotLinked' page.
    //
    ///////////////////////////////////////////////////////////////////////////
    if (error && error === 'OAuthAccountNotLinked') {
      toast.error(
        'To confirm your identity, sign in with the same account you used originally.',
        // 'That email is already being used in conjunction with a different provider.',
        {
          duration: Infinity
        }
      )
      return
    }

    // ⚠️ Comes from custom UnverifiedEmailError
    if (error && errorCode === 'email_unverified') {
      toast.error('Make sure to verify your email before logging in.', {
        duration: Infinity
      })
      return
    }

    if (error) {
      toast.error('Unable to log in. (1)', {
        duration: Infinity
      })
    }
  }, [error, errorCode])

  /* ======================
  handleCredentialsLogin()
  ====================== */
  ///////////////////////////////////////////////////////////////////////////
  //
  // https://github.com/AntonioErdeljac/next-auth-v5-advanced-guide/blob/master/actions/login.ts
  // Initially, I had a login() server action that was triggered here. It was based on
  // the following tutorial. It ran a bunch of checks then called the server-side signIn()
  // function from 'auth'. When a user logs out the session becomes null and status 'unauthenticate'.
  //
  // However, when the next user logs in, the session is not updated. Conversely, if you use the
  // client-side signIn(), it always works just fine. In other words, signing in from the client
  // syncs to the SessionProvider whereas signing in on the server does not.
  //
  //    https://github.com/nextauthjs/next-auth/issues/9504
  //
  // Note: the Credentials authorize() no longer supports returning custom errors when throwing
  // an error instead of returning null. This creates a problem because we can no longer provide
  // meaningful error messages to a user when their login attempt fails.
  //
  //   https://github.com/nextauthjs/next-auth/pull/9801
  //   https://github.com/nextauthjs/next-auth/discussions/8999
  //
  // Update: their is now a way to modify the code:
  // https://github.com/nextauthjs/next-auth/issues/9099
  //
  ///////////////////////////////////////////////////////////////////////////

  //! This still doesn't work!
  // const handleCredentialsLogin = async (e: any) => {
  //   e.preventDefault()
  //   setLoading(true)
  //   try {
  //     const res = await login({ email, password })

  //     if (res.success === false) {
  //       toast.error(res.message, {
  //         autoClose: false
  //       })
  //       return
  //     }
  //     ///////////////////////////////////////////////////////////////////////////
  //     //
  //     // The client-side signIn() will refresh the useSession hook and its data.
  //     // Without this call, the session will be updated but won't directly trigger the changes.
  //     // Cosequently, we seem to need to do this.
  //     //
  //     // Note also that calling session.update() here won't work because the
  //     // session is null. session.update() will return early if it detects a null session.
  //     // await update()
  //     //
  //     ///////////////////////////////////////////////////////////////////////////
  //     // const _session = await getSession() // This actually no longer works.

  //     toast.success('Login success.')

  //     router.replace(
  //       callbackUrl && !isPublicRoute ? callbackUrl : DEFAULT_LOGIN_REDIRECT
  //     )
  //   } catch {
  //     toast.error('Unable to log in.', {
  //       autoClose: false
  //     })
  //   } finally {
  //     setLoading(false)
  //     setEmail('')
  //     setPassword('')
  //   }
  // }

  //# This is a temporary dummy server action.
  const handleCredentialsLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login({ email, password })

      if (res.success === false && typeof res.message === 'string') {
        //! Temporary...
        console.log('originalMessage', res.originalMessage)
        console.log('message', res.message)
        toast.error(res.message, {
          duration: Infinity
        })
        return
      }

      toast.success('Login success.')

      //^ Not 100% sure why I was using !isPublicRoute here...
      //^ Maybe it had to do with publicRoutes creeping into the callbackUrl when logging out.
      //^ This may have been fixd by the following:
      // if (nextUrl.search) {
      //   if (nextUrl.search.includes('logout=true')) {
      //     return Response.redirect(new URL(`/login`, nextUrl))
      //   }
      // }
      //^ However, logout=true is also not yet being set on logout.

      router.replace(
        callbackUrl && !isPublicRoute ? callbackUrl : DEFAULT_LOGIN_REDIRECT
      )
    } catch {
      toast.error('Unable to log in.', {
        // duration: Infinity
      })
    } finally {
      setLoading(false)
      setEmail('')
      setPassword('')
    }
  }

  //* This works
  // const handleCredentialsLogin = async (e: any) => {
  //   e.preventDefault()

  //   setLoading(true)
  //   try {
  //     //# Using the client-side signIn() / signOut functions are a solution,
  //     //# but at some point we should try reimplementing the server side versions
  //     //# in order to try to figure out why they don't sync.
  //     //#
  //     //# Also, I'm not sure if the client-side version checks emailVerified.
  //     // https://authjs.dev/reference/nextjs/react#signin
  //     await signIn('credentials', {
  //       // callbackUrl: DEFAULT_LOGIN_REDIRECT
  //       callbackUrl: callbackUrl ? callbackUrl : '/', //! DEFAULT_LOGIN_REDIRECT, // is actually '/user'
  //       email,
  //       password
  //       // redirect: false
  //     })

  //     // toast.success('Login success.')
  //   } catch {
  //     toast.error('Unable to log in.', {
  //       duration: Infinity
  //     })
  //   } finally {
  //     setLoading(false)
  //     setEmail('')
  //     setPassword('')
  //   }
  // }

  /* ======================
          return
  ====================== */

  return (
    <Fragment>
      <form
        onSubmit={(e) => e.preventDefault()}
        className='mx-auto mb-6 max-w-lg overflow-hidden rounded-lg border border-neutral-500 bg-[#fafafa] shadow'
        noValidate
      >
        <div className='space-y-4 p-4'>
          <Input
            label='Email'
            labelRequired
            autoComplete='off'
            name='email'
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Email...'
            spellCheck={false}
            type='email'
            value={email}
          />

          <Input
            label='Password'
            labelRequired
            autoComplete='off'
            name='password'
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password...'
            spellCheck={false}
            type='password'
            value={password}
          />

          <Button
            className='flex w-full'
            loading={loading}
            type='button'
            onClick={handleCredentialsLogin}
          >
            Login
          </Button>
        </div>
      </form>
    </Fragment>
  )
}
