'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

import { Button, Input } from '@/components'
import { signUpDefaultValues } from '@/lib/constants'
import { signUpUser } from '@/lib/actions/user.actions'

/* ========================================================================

======================================================================== */

export const SignUpForm = () => {
  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: ''
  })

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  /* ======================
        SignUpButton
  ====================== */

  const SignUpButton = () => {
    const { pending } = useFormStatus()

    return (
      <Button
        loading={pending}
        className='flex w-full'
        type='submit'
        variant='primary'
      >
        {pending ? 'Submitting...' : 'Sign Up'}
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
      <input type='hidden' name='callbackUrl' value={callbackUrl} />

      <Input
        label='Name'
        labelRequired
        id='name'
        name='name'
        type='text'
        autoComplete='name'
        defaultValue={signUpDefaultValues.name}
      />

      <Input
        label='Email'
        labelRequired
        id='email'
        name='email'
        type='text'
        autoComplete='email'
        defaultValue={signUpDefaultValues.email}
      />

      <Input
        label='Password'
        labelRequired
        id='password'
        name='password'
        type='password'
        required
        autoComplete='password'
        defaultValue={signUpDefaultValues.password}
      />

      <Input
        label='Confirm Password'
        labelRequired
        id='confirmPassword'
        name='confirmPassword'
        type='password'
        required
        autoComplete='confirmPassword'
        defaultValue={signUpDefaultValues.confirmPassword}
      />

      <SignUpButton />

      {data && !data.success && (
        <div className='text-destructive text-center'>{data.message}</div>
      )}

      {/* 
        //# What is target='_self' ?

        */}
      <div className='text-muted-foreground text-center text-sm'>
        Already have an account?{' '}
        <Link href='/sign-in' target='_self' className='link'>
          Sign In
        </Link>
      </div>
    </form>
  )
}
