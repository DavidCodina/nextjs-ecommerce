import { CredentialsSignin } from 'next-auth'

// https://github.com/nextauthjs/next-auth/issues/9099
export class InvalidLoginError extends CredentialsSignin {
  // This can be changed, but only to another ErrorType (e.g., 'AccessDenied')
  // static type = "CredentialsSignin"
  code = 'invalid_credentials'
}

export class UnverifiedEmailError extends CredentialsSignin {
  code = 'email_unverified'
}
