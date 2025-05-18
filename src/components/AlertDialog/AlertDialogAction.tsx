'use client'

import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'
import { buttonVariants } from '@/components'

type AlertDialogActionProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Action
> &
  VariantProps<typeof buttonVariants>

/* ========================================================================

======================================================================== */
// The default ShadCN implementation did not include the buttonVariant props.

function AlertDialogAction({
  className,
  size,
  variant,
  ...props
}: AlertDialogActionProps) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { AlertDialogAction }
