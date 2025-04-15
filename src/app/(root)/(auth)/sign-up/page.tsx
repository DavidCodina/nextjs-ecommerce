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

import { SignUpForm } from './SignUpForm'
import { auth } from '@/auth'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Sign Up'
}

/* ========================================================================

======================================================================== */

const SignUpPage = async (props: {
  searchParams: Promise<{
    callbackUrl: string
  }>
}) => {
  const { callbackUrl } = await props.searchParams

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
            <CardTitle className='text-center'>Create Account</CardTitle>
            <CardDescription className='text-center'>
              Enter your information below to sign up
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <SignUpForm />
          </CardContent>
        </Card>
      </PageContainer>
    </Page>
  )
}

export default SignUpPage
