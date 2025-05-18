'use client'

import * as React from 'react'
import { cn } from '@/utils'
import { Input } from '@/components'

/* ========================================================================

======================================================================== */

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot='sidebar-input'
      data-sidebar='input'
      className={cn('bg-background h-8 w-full shadow-none', className)}
      {...props}
    />
  )
}

export { SidebarInput }
