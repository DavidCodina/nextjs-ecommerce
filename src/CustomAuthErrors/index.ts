import { CredentialsSignin } from 'next-auth'

// https://authjs.dev/getting-started/providers/credentials#custom-error-messages
// https://github.com/nextauthjs/next-auth/issues/9099
// https://github.com/nextauthjs/next-auth/pull/9801
// https://github.com/nextauthjs/next-auth/discussions/8999

export class InvalidLoginError extends CredentialsSignin {
  // This can be changed, but only to another ErrorType (e.g., 'AccessDenied')
  // static type = "CredentialsSignin"
  code = 'invalid_credentials'
}

export class UnverifiedEmailError extends CredentialsSignin {
  code = 'email_unverified'
}
