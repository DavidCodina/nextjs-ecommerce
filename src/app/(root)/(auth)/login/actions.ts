'use server'

import {
  // auth,
  signIn
  // signOut
} from '@/auth'

import { sleep } from 'utils/sleep'
// import * as bcrypt from 'bcrypt-ts-edge'

// Code With Antonio at 2:46:00 : https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s
// if (error instanceof AuthError) { ... }
// import { AuthError } from 'next-auth'
// import { isRedirectError } from 'next/dist/client/components/redirect-error'
// import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

//# import { generateVerificationToken } from 'lib/tokens'
//# import { sendVerificationEmail } from 'lib/mail'

// import { Session } from 'next-auth'
// import { cookies } from 'next/headers'
// import { decode } from 'next-auth/jwt'

type LoginResponse = {
  code?: string
  data: null
  message: string
  success: boolean
}

/* ========================================================================

======================================================================== */

export const login = async ({
  email,
  password
}: {
  email: string
  password: string
}): Promise<LoginResponse> => {
  await sleep(1000)
  /* ======================
        Validation
  ====================== */

  if (
    !email ||
    typeof email !== 'string' ||
    !password ||
    typeof password !== 'string'
  ) {
    return {
      code: '',
      data: null,
      message: 'Email and/or password is missing. (Server)',
      success: false
    }
  }

  try {
    // There shouldn't be any need to preemptively do a user existence check here.
    // In the Credentials authorize() function in auth.ts we are already checking for the user
    // by email. If they don't exist, we throw an error which then causes signIn() here to throw.

    //# When it comes time for the verification token check, do we need to do it here?
    //# You could preemptively do it here (in addition to within authorize()). The rationale
    //# for doing it here would be to tell the user that they need to verify their email first.
    //# However, if we are using a custom error message, then we can simply derive the information
    //# from the error generated within authorize().

    ///////////////////////////////////////////////////////////////////////////
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

    // The awaited return of signIn() is type never, and gives you nothing back.

    await signIn('credentials', {
      email,
      password,
      ///////////////////////////////////////////////////////////////////////////
      //
      // By default, the server-side signIn() will redirect.
      // If no explicit redirect is set, it defaults to the page URL
      // the sign-in is initiated from (or use: redirectTo: DEFAULT_LOGIN_REDIRECT).
      //
      // In other words, a 'NEXT_REDIRECT' errow will be thrown.
      // However, we are also catching all errors below. One way of
      // handling this is to rethrow in the catch block:
      //
      //   // import { isRedirectError } from 'next/dist/client/components/redirect-error'
      //   if (isRedirectError(err)) { throw err }
      //
      // However, I prefer to redirect after login manually, based
      // on the result of the server action. Consequently, I'm disabling
      // redirection here.
      //
      ///////////////////////////////////////////////////////////////////////////
      redirect: false
    })

    return {
      code: '',
      data: null,
      message: 'Login success.',
      success: true
    }
  } catch (err) {
    ///////////////////////////////////////////////////////////////////////////
    //
    // if (err instanceof Error) {
    //   let originalMessage = ''
    //
    //   if (
    //     err.cause &&
    //     typeof err.cause === 'object' &&
    //     'err' in err.cause &&
    //     err.cause.err instanceof Error
    //   ) {
    //     originalMessage = err.cause.err.message
    //   }
    //
    //   console.log({
    //     name: err.name,
    //     message: err.message,
    //     originalMessage
    //   })
    // }
    //
    ///////////////////////////////////////////////////////////////////////////

    // Not necessary because signIn is opting out of redirect.
    // if (isRedirectError(err)) { throw err }

    return {
      // The code would likely only be present if the err was
      // generated by the custom UnverifiedEmailError().
      code:
        err instanceof Error && 'code' in err && typeof err.code === 'string'
          ? err.code
          : '',
      data: null,
      message: "'Invalid email or password. (Server)",

      success: false
    }
  }
}
