'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Slot } from '@radix-ui/react-slot'
import { VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/utils'
import { useSidebar } from './SidebarProvider'
import { Tooltip } from '@/components/Tooltip'

/* ======================
 sidebarMenuButtonVariants 
====================== */

const sidebarMenuButtonBaseClasses = `
peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md 
p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding]
hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
focus-visible:ring-2 
active:bg-sidebar-accent active:text-sidebar-accent-foreground
disabled:pointer-events-none disabled:opacity-50 
group-has-data-[sidebar=menu-action]/menu-item:pr-8
aria-disabled:pointer-events-none aria-disabled:opacity-50 
data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground
data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground 
group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!
[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0
`

const sidebarMenuButtonVariants = cva(sidebarMenuButtonBaseClasses, {
  variants: {
    variant: {
      default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      outline:
        'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]'
    },
    size: {
      default: 'h-8 text-sm',
      sm: 'h-7 text-xs',
      lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
})

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content>

type SidebarMenuButtonProps = React.ComponentProps<'button'> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | TooltipContentProps
} & VariantProps<typeof sidebarMenuButtonVariants>

/* ========================================================================

======================================================================== */
// The SidebarMenuButton component is used to render a menu button within a SidebarMenuItem.
// By default, the SidebarMenuButton renders a button but you can use the asChild prop to
// render a different component such as a Link or an a tag.

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const { isMobile, state, collapsible, side } = useSidebar()

  const button = (
    <Comp
      data-slot='sidebar-menu-button'
      data-sidebar='menu-button'
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip
    }
  }

  /* ======================
          return
  ====================== */
  // By default, the tooltip feature is intended to work only when the
  // Sidebar is collapsed (i.e., when collapsible='icon'). That said,
  // the Sidebar is collapsed when isMobile, so it's also hidden when
  // isMobile. Change this as needed...

  if (state !== 'collapsed' || isMobile || collapsible === 'none') {
    return button
  }

  return (
    <Tooltip
      arrowStyle={{
        width: 10,
        height: 6
      }}
      delayDuration={0}
      trigger={button}
      side={side}
      {...tooltip}
      sideOffset={15}
    />
  )
}

export { SidebarMenuButton }
