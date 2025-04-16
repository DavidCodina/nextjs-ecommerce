'use client'

import { Fragment, useState, useEffect /*, useRef */ } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { /* useRouter, */ useSearchParams } from 'next/navigation'
// import Link from 'next/link'
import { signIn /* , getSession */ } from 'next-auth/react'

import { useAppContextSelector } from '@/contexts'

import { DEFAULT_LOGIN_REDIRECT } from 'routes'
import { login } from '../actions'
import { Button, Input } from '@/components'

/* ========================================================================

======================================================================== */

export const LoginForm = () => {
  const router = useRouter()
  const setSessionKey = useAppContextSelector('setSessionKey')
  const searchParams = useSearchParams()

  const error = searchParams?.get('error')
  const errorCode = searchParams?.get('code')
  const callbackUrl = searchParams?.get('callbackUrl')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  /* ======================
  handleCredentialsLogin()
  ====================== */
  ///////////////////////////////////////////////////////////////////////////
  //
  // SessionProvider Syncing Issue: https://github.com/nextauthjs/next-auth/issues/9504
  //
  // Moving the SessionProvider to (root)/template.tsx will work for everything inside of page.tsx files.
  // However, the Sidebar also needs access to the SessionProvider, so we actually need to move the all
  // Sidebar logic into the template.tsx file.
  //
  //   'use client'
  //   import { SessionProvider } from '@/contexts'
  //
  //   export default function SessionLayout({ children }: Readonly<{ children: React.ReactNode}>) {
  //     return (
  //       <SessionProvider>
  //         <SidebarProvider>
  //           ...
  //         </SidebarProvider>
  //       </SessionProvider>
  //     )
  //   }
  //
  //   This works because the SessionProvider is remounted on every page change.
  //   Of course, this means that you MUST change pages to see the client-side
  //   session update. That's not ideal. Presumably, when the SessionProvider
  //   mounts, it makes an API call to '/api/auth/session'. Consequently, this is
  //   actually more network traffic than simply using getSession() here (which works):
  //
  //     const _session = await getSession().
  //
  // However, a better solution than getSession() is to use sessionKey state form AppContext
  // to force a remount.
  //
  // Alternatively, If you're going to use client-side session logic, you could avoid all these
  // issues simply by sticking to ONLY using client-side signIn() and signOut() functions.
  // Signing in from the client syncs to the SessionProvider whereas signing in on the server does not.
  //
  ///////////////////////////////////////////////////////////////////////////

  const handleCredentialsLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login({ email, password })

      if (res.success === false) {
        if (typeof res.code === 'string' && res.code === 'email_unverified') {
          toast.error('Make sure to verify your email before logging in.', {
            // duration: Infinity
          })
        } else if (typeof res.message === 'string') {
          toast.error(res.message, {
            // duration: Infinity
          })
        }

        return
      }

      toast.success('Login success.')

      setSessionKey((v) => v + 1)
      router.replace(callbackUrl ? callbackUrl : DEFAULT_LOGIN_REDIRECT)
    } catch {
      toast.error('Unable to log in.')
    } finally {
      setLoading(false)
      setEmail('')
      setPassword('')
    }
  }

  /* ======================

  ====================== */

  const _handleCredentialsLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      // https://authjs.dev/reference/nextjs/react#signin
      await signIn('credentials', {
        callbackUrl: callbackUrl ? callbackUrl : DEFAULT_LOGIN_REDIRECT,
        email,
        password
        ///////////////////////////////////////////////////////////////////////////
        //
        // ⚠️ The client-side signIn() will automatically redirect to callbackUrl.
        // redirect: false could be useful if you want to run the toast notification
        // prior to redirecting. However, there's a big gotcha when using redirect: false.
        // If the login attempt fails, NextAuth will not reload the page and
        // not populate the URL with error or code params:
        //
        //   /login?error=CredentialsSignin&code=email_unverified
        //
        ///////////////////////////////////////////////////////////////////////////
        // ❌ redirect: false
      })

      // ❌ toast.success('Login success.')
      // ❌ router.replace(callbackUrl ? callbackUrl : DEFAULT_LOGIN_REDIRECT)
    } catch {
      toast.error('Unable to log in.')
    } finally {
      setLoading(false)
      setEmail('')
      setPassword('')
    }
  }

  /* ======================
        useEffect()
  ====================== */
  // This useEffect checks for a URL search parameter of 'error' when the component mounts.

  useEffect(() => {
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
        'To confirm your identity, sign in with the same account you used originally.'
        // 'That email is already being used in conjunction with a different provider.',
      )
      return
    }

    // ⚠️ Comes from custom UnverifiedEmailError
    if (error && errorCode === 'email_unverified') {
      toast.error('Make sure to verify your email before logging in.')
      return
    }

    if (error) {
      toast.error('Unable to log in. (1)')
    }
  }, [error, errorCode])

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
