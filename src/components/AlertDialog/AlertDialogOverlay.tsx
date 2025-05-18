'use client'

import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cn } from '@/utils'

import { ALERT_DIALOG_ZINDEX_CLASS } from '../component-constants'

const baseClasses = `
data-[state=open]:animate-in
data-[state=closed]:animate-out
data-[state=closed]:fade-out-0
data-[state=open]:fade-in-0 
fixed inset-0 bg-black/50
${ALERT_DIALOG_ZINDEX_CLASS}
`

/* ========================================================================

======================================================================== */

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot='alert-dialog-overlay'
      className={cn(baseClasses, className)}
      {...props}
    />
  )
}

export { AlertDialogOverlay }
