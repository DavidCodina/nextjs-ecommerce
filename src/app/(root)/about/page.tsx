import { Page, PageContainer, Title } from 'components'
import { sleep } from '@/utils'

/* ========================================================================

======================================================================== */

const About = async () => {
  await sleep(1000)
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
          About
        </Title>
      </PageContainer>
    </Page>
  )
}

export default About
