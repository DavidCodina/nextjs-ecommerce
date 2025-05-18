import * as React from 'react'
import { Page, PageContainer, Title } from '@/components'
import { ProductList } from '@/components/product/ProductList'
import { getLatestProducts } from '@/lib/actions/product.actions'
// ❌ import sampleData from '@/db/sample-data'

/* ========================================================================

======================================================================== */
///////////////////////////////////////////////////////////////////////////
//
// Temporary Notes:
//
//   1, Repo: https://github.com/bradtraversy/prostore
//
//   2. He uses Simple React Snippets VS Code extension.
//
//   3. Prisma Steps: npm i -D prisma @prisma/client
//      npx prisma init - This adds prisma folder at the project root.
//      It also adds a dummy DATABASE_URL in .env.
//      A script was added to package.json: "postinstall": "prisma generate"
//
//      We also run `npx prisma generate` manually during development.
//      This creates ./src/generated/prisma
//
//      We also want to create a migration that adds our model changes to the database.
//        npx prisma migrate dev --name init
//
//      To view database in Prisma studio, run: npx prisma studio
//      We can also view our tables from Neon.
//
//      For the Neon setup we also needed to do this prior to deploying to Vercel:
//
//        npm install @neondatabase/serverless
//
//      We also need a Prisma adapter and websocket connection for Neon.
//
//         @prisma/adapter-neon ws
//
//      Then we need additional dev dependencies:
//
//         npm i -D @types/ws bufferutil
//
/////////////////////////
//
// NextAuth:
//
//   Began watching Code With Antonio tutorial: https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s
//     It doesn't really get interesting until 1:40:00.
//     I then watched up to 3:480:00, but temporarily skipped sections after that.
//     Watched 5:55:00 - 6:47:30.
//     # Continue at 6:47:30 for email and/or password updates.
//
///////////////////////////////////////////////////////////////////////////

const Home = async () => {
  //! Here type _Price = Decimal
  const latestProducts = await getLatestProducts()

  return (
    <Page
      currentPageLoader
      currentPageLoaderProps={{
        className: 'border border-2 border-dashed border-pink-500'
      }}
    >
      <PageContainer>
        <Title
          as='h2'
          style={{
            marginBottom: 50,
            textAlign: 'center'
          }}
        >
          WELCOME TEST
        </Title>

        <ProductList data={latestProducts} title='Newest Arrivals' />
      </PageContainer>
    </Page>
  )
}

export default Home
