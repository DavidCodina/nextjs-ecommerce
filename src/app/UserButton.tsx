import Link from 'next/link'
import { UserIcon } from 'lucide-react'

import { Button } from '@/components/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/DropdownMenu'

import { auth } from '@/auth'
import { signOutUser } from '@/lib/actions/user.actions'

/* ========================================================================

======================================================================== */

export const UserButton = async () => {
  const session = await auth()

  if (!session) {
    return (
      <Button asChild>
        <Link href='/sign-in'>
          <UserIcon /> Sign In
        </Link>
      </Button>
    )
  }

  const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? 'U' // 'U' for user.

  /* ======================
          return
  ====================== */

  return (
    <div
      //! Do we need the wrapper div?
      className='flex items-center gap-2'
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            //! Again, why the wrapper div?
            className='flex items-center'
          >
            <Button
              variant='ghost'
              className='relative ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200'
            >
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className='w-56'
          align='end'
          //! Why forceMount?
          forceMount
        >
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <div className='text-sm leading-none font-medium'>
                {session.user?.name}
              </div>
              <div className='text-muted-foreground text-sm leading-none'>
                {session.user?.email}
              </div>
            </div>
          </DropdownMenuLabel>

          {/* <DropdownMenuItem>
            <Link href='/user/profile' className='w-full'>
              User Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href='/user/orders' className='w-full'>
              Order History
            </Link>
          </DropdownMenuItem> */}

          {/* {session?.user?.role === 'admin' && (
            <DropdownMenuItem>
              <Link href='/admin/overview' className='w-full'>
                Admin
              </Link>
            </DropdownMenuItem>
          )} */}

          <DropdownMenuItem className='mb-1 p-0'>
            {/* 
            //! No - Do not use a form / action
            //! The reason this is important in this case is because it
            //! Allows us to continue to use server components.
            */}
            <form action={signOutUser} className='w-full'>
              <Button className='flex w-full' type='submit' variant='secondary'>
                Sign Out
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
