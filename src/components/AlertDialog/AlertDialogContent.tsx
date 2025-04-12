'use client'

import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cn } from '@/utils'
import { AlertDialogPortal } from './AlertDialogPortal'
import { AlertDialogOverlay } from './AlertDialogOverlay'
import { ALERT_DIALOG_ZINDEX_CLASS } from '../component-constants'

const baseClasses = `
bg-background data-[state=open]:animate-in
data-[state=closed]:animate-out
data-[state=closed]:fade-out-0
data-[state=open]:fade-in-0
data-[state=closed]:zoom-out-95
data-[state=open]:zoom-in-95
fixed top-[50%] left-[50%]
grid w-full max-w-[calc(100%-2rem)]
translate-x-[-50%] translate-y-[-50%] duration-200
gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg
${ALERT_DIALOG_ZINDEX_CLASS}
`

/* ========================================================================

======================================================================== */

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot='alert-dialog-content'
        className={cn(baseClasses, className)}
        {...props}
      />
    </AlertDialogPortal>
  )
}

export { AlertDialogContent }
