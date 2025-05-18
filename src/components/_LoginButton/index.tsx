'use client'

import * as React from 'react'
import { Slot /*, Slottable */ } from '@radix-ui/react-slot'
type LoginButtonProps = React.ComponentProps<'button'> & {
  asChild?: boolean
  mode?: 'modal' | 'redirect'
}

/* ========================================================================

======================================================================== */
// Done in Code With Antionio around 45:00.
// This is essentially just a wrapper for turning things into login buttons.
// Not sure how useful it actually is...
// He uses this to do router.push('/auth/login'), so it's really just a navigation button.

export const LoginButton = ({
  asChild = false,
  children,
  mode = 'redirect',
  onClick
}: LoginButtonProps) => {
  const Component = asChild ? Slot : 'button'

  if (mode === 'modal') {
    //# Todo ...
  }

  return (
    <Component
      type='button'
      className=''
      onClick={(e) => {
        console.log('LoginButton clicked!')
        onClick?.(e)
      }}
    >
      {children}
    </Component>
  )
}
