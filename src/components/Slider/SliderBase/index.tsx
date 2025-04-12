'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/utils'

type SliderBaseProps = Omit<
  React.ComponentProps<typeof SliderPrimitive.Root>,
  'onValueCommit' | 'onBlur' | 'onChange' | 'onValueChange'
> & {
  error?: string
  onChange?: ((value: number[]) => void) | undefined
  onCommit?: ((value: number[]) => void) | undefined
  onBlur?: ((value: number[]) => void) | undefined
  touched?: boolean
}

const rootBaseClasses = `
relative flex w-full items-center
touch-none select-none
data-[orientation=vertical]:h-full
data-[orientation=vertical]:min-h-44
data-[orientation=vertical]:w-auto
data-[orientation=vertical]:flex-col
data-[disabled]:opacity-65
`

const trackBaseClasses = `
bg-accent relative grow overflow-hidden rounded-full
data-[orientation=horizontal]:h-1.5
data-[orientation=horizontal]:w-full
data-[orientation=vertical]:h-full
data-[orientation=vertical]:w-1.5
`

const rangeBaseClasses = `
bg-primary absolute
data-[orientation=horizontal]:h-full
data-[orientation=vertical]:w-full
`

// Gotcha: ShadCN originally used the `disabled:` variant.
// However, the SliderPrimitive.Root doesn't actually get the
// disabled attribute. Instead it gets `data-disabled`. The
// management of disabled styles has been moved into the
// maybeValidationMixin in the Slider component.
const thumbBaseClasses = `
block size-4 shrink-0
border-primary bg-background-light
rounded-full border shadow
transition-[color,box-shadow]
ring-primary/40
hover:ring-[3px] focus-visible:ring-[3px]
focus-visible:outline-hidden
`

/* ========================================================================

======================================================================== */

export const SliderBase = ({
  className,
  defaultValue,
  disabled = false,
  error = '',
  onBlur,
  onChange,
  onCommit,
  ref,
  value: controlledValue,
  min = 0,
  max = 100,
  touched = false,
  ...otherProps
}: SliderBaseProps) => {
  /* ======================
      state & refs
  ====================== */

  const [value, setValue] = React.useState(() => {
    if (Array.isArray(controlledValue) && controlledValue.length > 1) {
      return controlledValue
    }

    if (Array.isArray(defaultValue) && defaultValue.length > 1) {
      return defaultValue
    }
    return [min, max]
  })

  const firstRenderRef = React.useRef(true)

  const sliderRef = React.useRef<HTMLSpanElement>(null)

  // const value = React.useMemo(
  //   () =>
  //     Array.isArray(controlledValue)
  //       ? controlledValue
  //       : Array.isArray(defaultValue)
  //         ? defaultValue
  //         : [min, max],
  //   [controlledValue, defaultValue, min, max]
  // )

  /* ======================
    maybeValidationMixin
  ====================== */
  // In this case, FIELD_INVALID_MIXIN & FIELD_VALID_MIXIN make no difference here.

  const maybeValidationMixin = disabled
    ? `
    pointer-events-none opacity-65
    [&_[data-slot=slider-range]]:bg-neutral-400
    [&_[data-slot=slider-thumb]]:border-neutral-400
    `
    : error // i.e., !disabled && error
      ? `
      [&_[data-slot=slider-range]]:bg-destructive
      [&_[data-slot=slider-thumb]]:ring-destructive/40
      [&_[data-slot=slider-thumb]]:border-destructive
      `
      : touched // i.e., !disabled && !error && touched
        ? `
         [&_[data-slot=slider-range]]:bg-success
         [&_[data-slot=slider-thumb]]:ring-success/40
         [&_[data-slot=slider-thumb]]:border-success
        `
        : ``

  /* ======================
        useEffect()
  ====================== */
  // Every time controlledValue changes, conditionally call
  // setValue(controlledValue)

  React.useEffect(() => {
    if (firstRenderRef.current === true) {
      firstRenderRef.current = false
      return
    }
    if (
      typeof controlledValue !== 'undefined' &&
      Array.isArray(controlledValue) &&
      JSON.stringify(controlledValue) !== JSON.stringify(value)
    ) {
      setValue(controlledValue)
    }
  }, [controlledValue]) // eslint-disable-line

  /* ======================
          return
  ====================== */

  return (
    <SliderPrimitive.Root
      // maybeValidationMixin is intentionally last to
      // give precedence over the consumer className.
      className={cn(rootBaseClasses, className, maybeValidationMixin)}
      data-slot='slider'
      defaultValue={defaultValue}
      disabled={disabled}
      min={min}
      max={max}
      ref={(node) => {
        if (ref && 'current' in ref) {
          ref.current = node
        } else if (typeof ref === 'function') {
          ref?.(node)
        }
        sliderRef.current = node
      }}
      onBlur={() => {
        // Use setTimeout to create a new macrotask.
        setTimeout(() => {
          // The onBlur should only run when the element that gets
          // focus is outside of the slider container.
          // This creates the effect of a group blur.
          // By default, the slider would blur on each thumb.
          const slider = sliderRef.current
          const activeElement = document.activeElement
          if (slider && slider.contains(activeElement)) {
            return
          }
          onBlur?.(value)
        }, 0)
      }}
      onValueCommit={(value) => {
        setValue(value)
        onCommit?.(value)
      }}
      onValueChange={(value) => {
        onChange?.(value)
      }}
      value={controlledValue}
      {...otherProps}
    >
      <SliderPrimitive.Track
        data-slot='slider-track'
        className={cn(trackBaseClasses)}
      >
        <SliderPrimitive.Range
          data-slot='slider-range'
          className={cn(rangeBaseClasses)}
        />
      </SliderPrimitive.Track>

      {Array.from({ length: value.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot='slider-thumb'
          key={index}
          className={thumbBaseClasses}
        />
      ))}
    </SliderPrimitive.Root>
  )
}
