'use client'

import { Fragment, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button, Input } from '@/components'
import { register } from '../actions'

// import * as z from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";

/* ========================================================================

======================================================================== */

export const RegisterForm = () => {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [registrationPending, startRegistrationTransition] = useTransition()

  /* ======================

  ====================== */

  const handleSubmit = async () => {
    if (
      !name ||
      typeof name !== 'string' ||
      !email ||
      typeof email !== 'string' ||
      !password ||
      typeof password !== 'string' ||
      !confirmPassword ||
      typeof confirmPassword !== 'string'
    ) {
      toast.error('All fields are required.')
      return
    }

    startRegistrationTransition(async () => {
      try {
        const res = await register({ name, email, password, confirmPassword })

        ///////////////////////////////////////////////////////////////////////////
        //
        // If you wanted to automatically sign the user in after registering
        // you can import { signIn } from 'next-auth/react' then do this:
        //
        //   signIn('credentials', { email, password, callbackUrl: '/user' })
        //
        // However, it's probably better to not do this and instead create
        // an additional step whereby the user must verify their email prior
        // to logging in for the first time.
        //
        ///////////////////////////////////////////////////////////////////////////

        if (res.success === true) {
          // toast.success('Registration success! Confirmation email sent.')
          toast.success('Reigistration success!')
          router.push('/login')
        } else {
          toast.error('Unable to register.')
        }
      } catch {
        toast.error('Unable to register.', {
          duration: Infinity
        })
      } finally {
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    })
  }

  /* ======================
          return
  ====================== */

  return (
    <Fragment>
      <form
        onSubmit={(e) => e.preventDefault()}
        className='mx-auto mb-2 max-w-lg space-y-4 rounded-lg border border-neutral-500 bg-[#fafafa] p-4 shadow'
        noValidate
      >
        <Input
          label='Name'
          labelRequired
          autoComplete='off'
          name='name'
          onChange={(e) => setName(e.target.value)}
          placeholder='Name...'
          spellCheck={false}
          type='text'
          value={name}
        />

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

        <Input
          label='Confirm Password'
          labelRequired
          autoComplete='off'
          name='confirmPassword'
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='Confirm Password...'
          spellCheck={false}
          type='password'
          value={confirmPassword}
        />

        <Button
          className='flex w-full'
          loading={registrationPending}
          type='button'
          onClick={handleSubmit}
        >
          Register
        </Button>
      </form>

      {/* 
        //# What is target='_self' ?
      */}

      <div className='text-muted-foreground text-center text-sm'>
        Already have an account?{' '}
        <Link
          className='text-primary font-medium underline'
          href='/login'
          target='_self'
        >
          Sign In
        </Link>
      </div>
    </Fragment>
  )
}
