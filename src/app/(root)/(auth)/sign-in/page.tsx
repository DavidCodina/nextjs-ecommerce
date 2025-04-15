import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Image from 'next/image'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Page,
  PageContainer
} from '@/components'

import { CredentialsSignInForm } from './CredentialsSignInForm'
import { auth } from '@/auth'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Sign In'
}

/* ========================================================================

======================================================================== */

const SignInPage = async (props: {
  searchParams: Promise<{
    callbackUrl: string
  }>
}) => {
  const { callbackUrl } = await props.searchParams

  // auth() works because the component is a server component.
  const session = await auth()

  if (session) {
    return redirect(callbackUrl || '/')
  }

  /* ======================
          return
  ====================== */

  return (
    <Page>
      <PageContainer className='flex items-center justify-center'>
        <Card className='w-lg'>
          <CardHeader className='space-y-4'>
            <Link href='/' className='flex justify-center'>
              <Image
                src='/images/logo.svg'
                width={100}
                height={100}
                alt={`${APP_NAME} logo`}
                priority={true}
              />
            </Link>
            <CardTitle className='text-center'>Sign In</CardTitle>
            <CardDescription className='text-center'>
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-4'>
            <CredentialsSignInForm />
          </CardContent>
        </Card>
      </PageContainer>
    </Page>
  )
}

export default SignInPage
