'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/utils'

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & {
  disabled?: boolean
  error?: string
  labelRequired?: boolean
  // Omit touched to prevent success styles.
  touched?: boolean
}

const baseClasses = `
flex items-center text-sm leading-none 
font-medium select-none
`

/* ========================================================================

======================================================================== */

export const Label = ({
  className,
  children,
  disabled = false,
  error = '',
  labelRequired,
  // It may seem more conventional to use something like `isValid`, but
  // the combination of `error` and `touched` allows for maximum flexibility.
  touched = false,
  ...otherProps
}: LabelProps) => {
  const labelRef = React.useRef<HTMLLabelElement | null>(null)

  /* ======================

  ====================== */
  // Why implement useEffect to render the <sup> element?
  // Why not add the conditional JSX right after { children } below?
  // In some cases, we may want to use <Label asChild><div>...</div></Label>
  // If you do this, an Error will be thrown because the asChild (i.e., Slot)
  // feature expects there to be only a single child

  React.useEffect(() => {
    const labelElement = labelRef.current
    const supClasses = cn('text-destructive relative -top-1 text-[1.25em]', {
      'text-success': !error && touched,
      'text-[inherit]': disabled
    })

    const supElement = document.createElement('sup')

    if (labelElement && labelRequired) {
      supElement.className = supClasses
      supElement.textContent = '*'
      labelElement.appendChild(supElement)
    }

    return () => {
      if (labelElement && supElement.parentNode === labelElement) {
        labelElement.removeChild(supElement)
      }
    }
  }, [labelRequired, error, touched, disabled])

  /* ======================
            return
  ====================== */

  return (
    <LabelPrimitive.Root
      ref={labelRef}
      data-slot='label'
      className={cn(baseClasses, className, {
        // Intentionally placed after className to always have precedence.
        'text-destructive': !!error,
        'text-success': !error && touched,
        'text-muted-foreground pointer-events-none opacity-65': disabled
      })}
      {...otherProps}
    >
      {children}
    </LabelPrimitive.Root>
  )
}
