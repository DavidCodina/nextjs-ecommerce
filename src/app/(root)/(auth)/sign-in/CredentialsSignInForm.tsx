'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { Button, Input } from '@/components'
import { signInWithCredentials } from '@/lib/actions/user.actions'

/* ========================================================================

======================================================================== */

export const CredentialsSignInForm = () => {
  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: ''
  })

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  /* ======================
        SignInButton
  ====================== */

  const SignInButton = () => {
    const { pending } = useFormStatus() //! No

    return (
      <Button
        className='flex w-full'
        loading={pending}
        type='submit'
        variant='primary'
      >
        {pending ? 'Signing In...' : 'Sign In'}
      </Button>
    )
  }

  /* ======================
          return
  ====================== */

  return (
    <form
      //! No - Do not use action
      action={action}
      className='space-y-6'
    >
      {/* 
      //# How does this work? Why is this here?
      //# Presumably, this works in conjunction with the action prop?
      */}
      <input type='hidden' name='callbackUrl' value={callbackUrl} />

      <Input
        label='Email'
        labelRequired
        id='email'
        name='email'
        type='email'
        required
        autoComplete='email'
        //! defaultValue={signInDefaultValues.email}
      />

      <Input
        label='Password'
        labelRequired
        id='password'
        name='password'
        type='password'
        required
        autoComplete='password'
        //! defaultValue={signInDefaultValues.password}
      />

      <SignInButton />

      {data && !data.success && (
        <div className='text-destructive text-center'>{data.message}</div>
      )}

      <div className='text-muted-foreground text-center text-sm'>
        {/* 
        //# What is target='_self' ?
        //# Why is the default behavior of Next.js to avoid ' ?
        */}
        Don&apos;t have an account?{' '}
        <Link
          // ??? className='link'
          href='/sign-up'
          target='_self'
        >
          Sign Up
        </Link>
      </div>
    </form>
  )
}
