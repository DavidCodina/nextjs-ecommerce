import type { Metadata } from 'next'

import { Page, PageContainer, Title } from '@/components'
import { LoginForm } from './components/LoginForm'

export const metadata: Metadata = {
  title: 'Login',
  description: 'The Login Page'
}

/* ========================================================================
                                PageLogin
======================================================================== */

const PageLogin = () => {
  /* ======================
          return
  ====================== */

  return (
    <Page>
      <PageContainer>
        <Title
          as='h2'
          style={{
            marginBottom: 50,
            textAlign: 'center'
          }}
        >
          Login
        </Title>

        <LoginForm />
      </PageContainer>
    </Page>
  )
}

export default PageLogin
