///////////////////////////////////////////////////////////////////////////
//
// To integrate Neon into your Next.js app that uses Prisma and @prisma/client
// version 6.6.0, you need to use Neon's serverless PostgreSQL driver along
// with Prisma's official adapter for Neon. The combination of @neondatabase/serverless
// package with @prisma/adapter-neon is specifically designed for edge environments.
//
// Here's an official Prisma video demonstrating this process. That said, the configuration
// is now a little different - we no longer need Pool, etc. Here's a tutorial showing the old
// way of doing this: https://www.youtube.com/watch?v=Ti6oKI4i_Sk
//
// Here are the required packages:
//
//   @prisma/adapter-neon
//   https://neon.tech/docs/guides/prisma
//
//   @neondatabase/serverless
//   https://neon.tech/docs/guides/nextjs#create-a-nextjs-project-and-add-dependencies
//
//   ws
//   https://neon.tech/docs/guides/prisma
//
// See here for more on Prisma driver adapters:
//
//   https://www.prisma.io/docs/orm/overview/databases/database-drivers#driver-adapters
//   "Driver adapters enable edge deployments of applications that use Prisma ORM."
//
// See here for a general guide on connecting Prisma to Neon:
//
//   https://www.prisma.io/docs/orm/overview/databases/neon //# Review this an all associated links.
//
//
// The setup for Prisma with Neon is highly specific.
// However, there are more general aricles that discuss how to set up Prisma in Next.js
// in order to avoid creating multiple PrismaClient instances.
//
//   https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help
//   https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/instantiate-prisma-client
//   https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections

//
// This latter approach is useful for Express apps when hot relaoding.
//
///////////////////////////////////////////////////////////////////////////

// ⚠️ A Postgres cloud database can also be provisioned from console.prisma.io
// Currently, Prisma Postgres offers only PostgreSQL as its database type.
// Prisma officially launched Prisma Postgres as a Generally Available product on February 2nd, 2025.
// https://www.youtube.com/watch?v=JDV8CKULPIk
// https://www.youtube.com/watch?v=JYLSdLrKL1k
import { /* Pool, */ neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'
import { PrismaClient /* , Prisma */ } from '@/generated/prisma'

// Sets up WebSocket connections, which enables Neon to use WebSocket communication.
// WebSockets is critical for edge environments that don't support TCP sockets.
neonConfig.webSocketConstructor = ws

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL must be set.')
}
const connectionString = `${DATABASE_URL}`

///////////////////////////////////////////////////////////////////////////
//
// Gotcha: Typescript Error
//
//   const pool    = new Pool({ connectionString })
//   const adapter = new PrismaNeon(pool)
//
//     Argument of type 'Pool' is not assignable to parameter of type 'PoolConfig'.
//     Types of property 'options' are incompatible.
//     Type 'PoolOptions' is not assignable to type 'string'.ts(2345)
//
// The latest updates to @prisma/adapter-neon now allow Prisma to connect directly
// to Neon without needing Pool from @neondatabase/serverless. See here:
// https://www.npmjs.com/package/@prisma/adapter-neon
//
///////////////////////////////////////////////////////////////////////////

// https://www.prisma.io/docs/orm/overview/databases/database-drivers#new-driver-adapters-api-in-v660
// In v6.6.0, we introduced a simplified version for instantiating Prisma Client when using driver adapters.
// You now don't need to create an instance of the driver/client to pass to a driver adapter,
// instead you can just create the driver adapter directly (and pass the driver's options to it if needed).
//
// new PrismaClient({ adapter }) replaces Prisma's default connection handling with Neon's edge-compatible approach.
const adapter = new PrismaNeon({ connectionString })

/* ========================================================================

======================================================================== */
// Extends the PrismaClient with a custom result transformer to convert
// the price and rating fields to strings. Prisma’s schema (schema.prisma)
// itself doesn’t support defining computed transformations like converting
// decimals to strings. The database schema is purely declarative—it defines
// structure but doesn’t execute transformations.

// Gotcha: Brad did not include logic for preventing multiple PrismaClient instances.
// This is explicitly demonstrated in https://neon.tech/docs/guides/prisma

/* ======================

====================== */

const createExtendedPrismaClient = () => {
  return new PrismaClient({
    adapter
    // See here at 3:30 : https://www.youtube.com/watch?v=Sdd1ScMHzrI
    // To get the password back you should be able to locally override:  select: { password: true }
    // omit: {
    //   user: { password: true }
    // }
  }).$extends({
    // How To Build a Prisma Client Extension: https://www.youtube.com/watch?v=j5LU6q38E-c
    // While using $allModels is a valid approach, the video points out at 4:00 that you're
    // sacrificing some type safety. When you use the generic $allModels approach, the runtime
    // transformation happens, but the TypeScript types remain based on the original Prisma schema.
    // ❌ model: { $allModels: {} },
    result: {
      user: {
        role: {
          compute(user) {
            return user.role.toString()
          }
        }
      },
      product: {
        price: {
          compute(product) {
            return product.price.toString()
          }
        },

        rating: {
          compute(product) {
            return product.rating.toString()
          }
        },

        ///////////////////////////////////////////////////////////////////////////
        //
        // Following Brad's preemptive serialization approach, I also changed createdAt
        // into a string. Technically, you can pass a Date across the server/client boundary, and
        // it will automatically be seriaized into a string. Thus unlike Decimal, JSON knows how
        // to convert this value. However, it's still a good idea to explicitly tranform the value
        // here so that there is fidelity between the Typescript Product type and the inferred type
        // from Prisma. The tradeoff is that if we ever need to use createdAt on the server, prior to
        // sending it to the client, we will need to remember that it's actually an ISO 8601 string.
        //
        ///////////////////////////////////////////////////////////////////////////
        createdAt: {
          compute(product) {
            return product.createdAt.toString()
          }
        }
      }
    }
  })
}

/* ======================

====================== */

type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>
const globalForPrisma = global as unknown as { prisma: ExtendedPrismaClient }

export const prisma = globalForPrisma.prisma || createExtendedPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
