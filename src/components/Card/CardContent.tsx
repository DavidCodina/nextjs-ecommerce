'use client'

import * as React from 'react'
import { cn } from '@/utils'

const baseClasses = `px-6 mt-6 last:mb-6`

/* ========================================================================

======================================================================== */

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-content'
      className={cn(baseClasses, className)}
      {...props}
    />
  )
}

export { CardContent }
