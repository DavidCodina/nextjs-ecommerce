'use client'

import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'
import { buttonVariants } from '@/components'

type AlertDialogCancelProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Cancel
> &
  VariantProps<typeof buttonVariants>

/* ========================================================================

======================================================================== */
// The default ShadCN implementation did not include the buttonVariant props.

function AlertDialogCancel({
  className,
  size,
  variant = 'outline',
  ...props
}: AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { AlertDialogCancel }
