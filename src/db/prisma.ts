///////////////////////////////////////////////////////////////////////////
//
// To integrate Neon into your Next.js app that uses Prisma and @prisma/client
// version 6.6.0, you need to use Neon's serverless PostgreSQL driver along
// with Prisma's official adapter for Neon. Here are the required packages:
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

import { /* Pool, */ neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'
import { PrismaClient /*, Prisma */ } from '@/generated/prisma'

// Sets up WebSocket connections, which enables Neon to use WebSocket communication.
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

const adapter = new PrismaNeon({ connectionString })

//# This implementation doesn't create any kind of logic to avoid multiple
//# client instances. Is that handled internally?
/* ========================================================================

======================================================================== */
// Extends the PrismaClient with a custom result transformer to convert
// the price and rating fields to strings. Prisma’s schema (schema.prisma)
// itself doesn’t support defining computed transformations like converting
// decimals to strings. The database schema is purely declarative—it defines
// structure but doesn’t execute transformations.

export const prisma = new PrismaClient({ adapter }).$extends({
  result: {
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

    // cart: {
    //   itemsPrice: {
    //     needs: { itemsPrice: true },
    //     compute(cart) {
    //       return cart.itemsPrice.toString()
    //     }
    //   },
    //   shippingPrice: {
    //     needs: { shippingPrice: true },
    //     compute(cart) {
    //       return cart.shippingPrice.toString()
    //     }
    //   },
    //   taxPrice: {
    //     needs: { taxPrice: true },
    //     compute(cart) {
    //       return cart.taxPrice.toString()
    //     }
    //   },
    //   totalPrice: {
    //     needs: { totalPrice: true },
    //     compute(cart) {
    //       return cart.totalPrice.toString()
    //     }
    //   }
    // },
    // order: {
    //   itemsPrice: {
    //     needs: { itemsPrice: true },
    //     compute(cart) {
    //       return cart.itemsPrice.toString()
    //     }
    //   },
    //   shippingPrice: {
    //     needs: { shippingPrice: true },
    //     compute(cart) {
    //       return cart.shippingPrice.toString()
    //     }
    //   },
    //   taxPrice: {
    //     needs: { taxPrice: true },
    //     compute(cart) {
    //       return cart.taxPrice.toString()
    //     }
    //   },
    //   totalPrice: {
    //     needs: { totalPrice: true },
    //     compute(cart) {
    //       return cart.totalPrice.toString()
    //     }
    //   }
    // },
    // orderItem: {
    //   price: {
    //     compute(cart) {
    //       return cart.price.toString()
    //     }
    //   }
    // }
  }
})
