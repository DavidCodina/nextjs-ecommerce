'use client'

// import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  // Calendar,
  Home,
  Info,
  ShoppingCart,
  UserIcon
  // Inbox,
  // Search,
  // Settings,
  // Settings2,
  // ChevronDown,
  // Plus,
  // Menu,
  // MoreHorizontal
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  // SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  // SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarRail,
  // SidebarGroupAction,
  // SidebarMenuAction,
  // SidebarMenuSub,
  // SidebarMenuSubItem,
  // SidebarMenuSubButton,
  // SidebarMenuBadge,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar
} from './Sidebar'

// import {
//   Collapsible,
//   CollapsibleTrigger,
//   CollapsibleContent
// } from './collapsible'

// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem
// } from './dropdown-menu'

import { ThemeToggle } from 'components'

import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_MOBILE } from './Sidebar/SidebarConstants'

const items = [
  {
    title: 'Home',
    url: '/',
    icon: Home
  },

  {
    title: 'Info',
    url: '/about',
    icon: Info
  },
  {
    title: 'Cart',
    url: '/cart',
    icon: ShoppingCart
  },
  {
    title: 'Sign In',
    url: '/sign-in',
    icon: UserIcon
  }
]

import { SIDEBAR_ZINDEX_CLASS } from 'components/component-constants'
import { cn } from '@/utils'

/* ========================================================================

======================================================================== */

export const AppSidebar = () => {
  const { open, openMobile, isMobile, collapsible, variant /*, side */ } =
    useSidebar()
  const isOpen = (open && !isMobile) || (openMobile && isMobile)
  const isClosed = !isOpen

  const _isOffcanvas = collapsible === 'offcanvas'
  const isIcon = collapsible === 'icon'
  const isNone = collapsible === 'none'

  const _isIconAndOpen = isIcon && isOpen
  const _isIconAndClosed = isIcon && isClosed

  const sidebarWidth = isMobile ? SIDEBAR_WIDTH_MOBILE : SIDEBAR_WIDTH
  const floatingOffset = '16px'

  /* ======================
      renderNavLinkGroup()
  ====================== */

  const renderNavLinkGroup = () => {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu className='gap-2'>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  // Use the isActive prop to mark a menu item as active.
                  // This essentially changes the styles in the component by setting this: data-active={isActive}
                  // Then using the data-[active=true]: modifier. The current styles are very subtle.
                  // Right now it doesn't make any sense to implement isActive because we're mapping over the
                  // dummy items, but eventually, we can set it.
                  tooltip={item.title}
                >
                  <Link href={item.url} className='text-[inherit]'>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  /* ======================
          return
  ====================== */

  return (
    <Sidebar className={SIDEBAR_ZINDEX_CLASS}>
      <div
        className={cn('flex items-center px-2', {
          'justify-between': !isNone
        })}
        style={{
          // When floating or inset, the Sidebar component sets `p-2`. This offsets that.
          minWidth:
            variant === 'floating' || variant === 'inset'
              ? `calc(${sidebarWidth} - ${floatingOffset})`
              : sidebarWidth
        }}
      >
        {collapsible !== 'none' && (
          <SidebarTrigger className='cursor-pointer' />
        )}

        <SidebarHeader>Sidebar Header</SidebarHeader>

        {/* Conditionally setting tabIndex to -1 is very important! 
        When defaultCollapsible='icon', the content is hidden with
        overflow-hidden (now overflow-clip) in Sidebar.tsx. If you try 
        to tab to an element that is effectively hidden, the browser will 
        have a meltdown and crash the layout. This ultimately was causing
        all of SidebarContent to momentarily disappear! */}
        <ThemeToggle tabIndex={isClosed ? -1 : 0} />
      </div>

      <SidebarSeparator />

      <SidebarContent>{renderNavLinkGroup()}</SidebarContent>
    </Sidebar>
  )
}
