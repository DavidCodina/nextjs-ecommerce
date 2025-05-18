'use client'

import {
  Fragment,
  useState,
  useEffect,
  useTransition
  // useActionState
} from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { /* useRouter, */ useSearchParams } from 'next/navigation'
// import Link from 'next/link'
import { signIn /* , getSession */ } from 'next-auth/react'

import { useAppContextSelector } from '@/contexts'

import { DEFAULT_LOGIN_REDIRECT } from 'routes'
import { login } from '../actions'
import { Button, Input } from '@/components'

// const googleSVG = (
//   <svg width='32px' height='32px' viewBox='0 0 16 16' fill='none'>
//     <path
//       fill='#4285F4'
//       d='M14.9 8.161c0-.476-.039-.954-.121-1.422h-6.64v2.695h3.802a3.24 3.24 0 01-1.407 2.127v1.75h2.269c1.332-1.22 2.097-3.02 2.097-5.15z'
//     />
//     <path
//       fill='#34A853'
//       d='M8.14 15c1.898 0 3.499-.62 4.665-1.69l-2.268-1.749c-.631.427-1.446.669-2.395.669-1.836 0-3.393-1.232-3.952-2.888H1.85v1.803A7.044 7.044 0 008.14 15z'
//     />
//     <path
//       fill='#FBBC04'
//       d='M4.187 9.342a4.17 4.17 0 010-2.68V4.859H1.849a6.97 6.97 0 000 6.286l2.338-1.803z'
//     />
//     <path
//       fill='#EA4335'
//       d='M8.14 3.77a3.837 3.837 0 012.7 1.05l2.01-1.999a6.786 6.786 0 00-4.71-1.82 7.042 7.042 0 00-6.29 3.858L4.186 6.66c.556-1.658 2.116-2.89 3.952-2.89z'
//     />
//   </svg>
// )

// const githubSVG = (
//   <svg width='32' height='32' fill='currentColor' viewBox='0 0 16 16'>
//     <path d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8' />
//   </svg>
// )

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
  const [_loading, setLoading] = useState(false)
  const [credentialsLoginPending, startCredentialsLoginTransition] =
    useTransition()

  /* ======================

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

  const credentialsLoginFromServer = async (e: any) => {
    e.preventDefault()

    if (
      !email ||
      typeof email !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      toast.error('Email and password are required.')
      return
    }

    startCredentialsLoginTransition(async () => {
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
        setEmail('')
        setPassword('')
      }
    })
  }

  /* ======================

  ====================== */

  const _credentialsLoginFromClient = async (e: any) => {
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
      handleOAuthLogin()
  ====================== */

  const _handleOAuthLogin = /* async */ (provider: 'google' | 'github') => {
    signIn(provider, {
      ///////////////////////////////////////////////////////////////////////////
      //
      // Gotcha: The error handling process for OAuth login is ENTIRELY different!
      // For the Credentials provider, when a user attempts to sign in and fails, signIn() returns
      // a Promise object. This is because the Credentials provider uses the authorize() function,
      // which you define, to authenticate the user.
      //
      // On the other hand, for OAuth providers like Google, the signIn() function does NOT return a Promise.
      // Instead, it initiates the OAuth flow, which involves redirecting the user to the OAuth provider's
      // website for authentication. Once the user has authenticated (or failed to authenticate),
      // they are redirected back to your application. The result of the OAuth signIn() will always be undefined.
      //
      // If the signIn() process fails during the OAuth flow, the user will be redirected to...
      // the application with an 'error' query parameter. The value of this parameter will be
      // a string that describes the error, such as 'OAuthAccountNotLinked', etc.
      // This can be used to handle the errors as needed.
      //
      // There is next to no documentation on handling these kinds of errors, but there
      // are a few examples out there:
      //
      //  Code With Antonio at 3:43:30 : https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s
      //  https://logfetch.com/next-auth-custom-error-page/
      //
      // Because the redirect triggers a location.reload(), we can handle the errors
      // by checking the 'error' search param on mount through a useEffect().
      //
      // Note: Even without the callbackUrl, an OAuth sign in will reload() the page.
      // At that point the user will be authenticated, which will cause the middleware
      // to redirect to DEFAULT_LOGIN_REDIRECT if nothing is specified here.
      //
      ///////////////////////////////////////////////////////////////////////////

      callbackUrl: callbackUrl ? callbackUrl : DEFAULT_LOGIN_REDIRECT
    }).catch((_err) => {
      // This will likely never get triggered.
      toast.error('Unable to log in.')
    })
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

    // When does this happen? This would happen if you used email/password credentials,
    // then you tried to sign in with Google using the same gmail account you already used
    // for email/password credentials.
    if (error && error === 'OAuthAccountNotLinked') {
      toast.error(
        // This message is the same one that is used by the default NextAuth when
        // See here at 3:37:00 : https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s
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
        // ⚠️ Do not do this if using action={} here or formAction on Button.
        onSubmit={(e) => e.preventDefault()}
        // action={credentialsLoginAction}
        className='mx-auto mb-2 max-w-lg overflow-hidden rounded-lg border border-neutral-500 bg-[#fafafa] shadow'
        noValidate
      >
        {/* <div
          className='flex justify-center gap-6 bg-white px-4 py-2'
          style={{ boxShadow: '0px 1px 3px rgba(0,0,0,0.25)' }}
        >
          <button
            className='transition-transform hover:scale-125'
            onClick={() => {
              handleOAuthLogin('google')
            }}
            type='button'
          >
            {googleSVG}
          </button>

          <button
            className='transition-transform hover:scale-125'
            onClick={() => {
              handleOAuthLogin('github')
            }}
            type='button'
          >
            {githubSVG}
          </button>
        </div> */}

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
            loading={credentialsLoginPending}
            // ⚠️ Explicitly set to type='submit' if using 'formAction` or `action` props.
            // formAction={credentialsLoginAction}
            onClick={credentialsLoginFromServer}
          >
            Login
          </Button>
        </div>
      </form>

      <div className='text-muted-foreground text-center text-sm'>
        {/* 
        //# What is target='_self' ?
        //# Why is the default behavior of Next.js to avoid ' ?
        */}
        Don&apos;t have an account?{' '}
        <Link
          className='text-primary font-medium underline'
          href='/register'
          target='_self'
        >
          Sign Up
        </Link>
      </div>
    </Fragment>
  )
}
