'use client'

import * as React from 'react'
import { cn } from '@/utils'

type ModalFooterProps = React.ComponentProps<'div'>

const baseClasses = `
flex items-center justify-center shrink-0 flex-wrap gap-2 px-4 py-2
rounded-b-[calc(var(--modal-border-radius)_-_1px)]
`

/* ========================================================================

======================================================================== */

export const ModalFooter = ({
  children,
  className = '',
  style = {},
  ...otherProps
}: ModalFooterProps) => {
  /* ======================
          return
  ====================== */

  return (
    <div
      className={cn(baseClasses, className)}
      data-slot='modal-footer'
      style={style}
      {...otherProps}
    >
      {children}
    </div>
  )
}
