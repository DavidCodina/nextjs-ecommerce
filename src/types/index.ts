// ❌ import { z } from 'zod'
// ❌ import { insertProductSchema } from '@/lib/validators'

// This is an example of a type that can be used as a client/server contract for API calls.
export type Code =
  | 'OK'
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'
  | 'STOCK_ERROR_FOUND'
  | 'PRICE_ERROR_FOUND'
  | 'ORDER_EXISTS'
  | 'USER_ARCHIVED'

export type ResBody<DataType> = {
  data: DataType
  message: string
  success: boolean
  errors?: Record<string, string> | null
  code?: Code

  // Adding this makes the type more flexible, while still being informative. That
  // said, if you need additional properties, it's MUCH safer to write a custom type.
  [key: string]: any
}

export type ResponsePromise<T = unknown> = Promise<ResBody<T>>

///////////////////////////////////////////////////////////////////////////
//
// ⚠️ Brad uses Zod schemas to infer all or part of the type
// I'm not a fan of this approach at all!
//
//   export type Product = z.infer<typeof insertProductSchema> & {
//     id: string
//     rating: string
//     numReviews: number
//     createdAt: Date // ❌ Wrong!
//   }
//
// First off, it's not immediately evident what the type is because it's
// abstracted. Second, it creates a dependency on Zod. Third, you have to
// amend the Zod inference by adding/omitting various properties. Instead,
// all types should be defined manually and reflect the actual database
// value AFTER BEING SERIALIZED!
//
// In regard to the last point, Prisma maps the Decimal type to PostgreSQL's numeric type.
// Conversely, when you actually check the type of the data in Typescript, it's a string.
// This all gets kind of confusing. That said, taking Zod type inference out of the equation
// helps to keep things simple.
//
// If you're uncertain what a particular Prisma type serialized to, consult with docs or AI.
// Also, you can actually get a type inferred from the associated Prisma model:
//
//   import { Prisma } from '@/generated/prisma'
//   export type Product = Prisma.ProductGetPayload<{}>;
//
// Unfortunately, Prisma's types are generated before applying $extends, which
// means they won't accurately reflect any transformations executed in src/db/prisma.ts.
// You would have to make those changes here manually.
//
//   type BaseProduct = Prisma.ProductGetPayload<{}>;
//
//   type TransformedProduct = Omit<BaseProduct, 'price' | 'rating' | 'createdAt'> & {
//     price: string;
//     rating: string;
//     createdAt: string;
//   }
//
///////////////////////////////////////////////////////////////////////////

export type Product = {
  id: string
  name: string
  slug: string
  category: string
  images: string[]
  brand: string
  description: string
  stock: number
  price: string // Serialized Decimal becomes a string
  rating: string // Serialized Decimal becomes a string
  numReviews: number
  isFeatured: boolean
  banner: string | null
  createdAt: string // Serialized DateTime becomes a string (ISO 8601 format)
}
