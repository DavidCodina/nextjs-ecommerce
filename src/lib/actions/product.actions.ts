'use server'

// Rather than using: import { PrismaClient } from '@/generated/prisma'
// We now get the Prisma client from src/db/prisma.ts. This version
// of the prisma client builds on top of the one from 'src/generated/prisma'
// such that it is set up to be integrated with @neondatabase/serverless,
// @prisma/adapter-neon and ws. Additionally, it bakes in certain transformations.
import { prisma } from '@/db/prisma'
import {
  serializeData
  //# formatError
} from '@/utils'

import {
  LATEST_PRODUCTS_LIMIT
  //#, PAGE_SIZE
} from '@/lib/constants'

// import { prisma } from '@/db/prisma'
// import { convertToPlainObject, formatError } from '../utils'

// import { revalidatePath } from 'next/cache'
// import { insertProductSchema, updateProductSchema } from '../validators'
// import { z } from 'zod'
// import { Prisma } from '@prisma/client'

/* ========================================================================

======================================================================== */

/* ======================

====================== */
// Get latest products

///////////////////////////////////////////////////////////////////////////
//
// Gotcha: ❌ return data
//
// Brad Traversy had issues when returning a the Prisma object directly.
//
//   const data: {
//     id: string;
//     name: string;
//     slug: string;
//     category: string;
//     images: string[];
//     brand: string;
//     description: string;
//     stock: number;
//     price: Decimal;
//     rating: Decimal;
//     numReviews: number;
//     isFeatured: boolean;
//     banner: string | null;
//     createdAt: Date;
// }[]
//
// This won't happen when data never crosses the server/client boundary, but
// if it does (e.g., if ProductList is a client component):
//
//   <ProductList data={latestProducts} title='Newest Arrivals' />
//
// Then we get this error:
//
//   Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported...
//
// Ultimately, this happens because what we're getting back is a Prisma object, and in this case the
// Decimal type is not serializable.
//
///////////////////////////////////////////////////////////////////////////

//! Shouldn't we be wrapping these in try/catch?

export const getLatestProducts = async () => {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: 'desc' }
  })

  ///////////////////////////////////////////////////////////////////////////
  //
  // serializeData() is set up to give you back a type of unknown.
  // Brad, on the other hand, used generics, so it would give you back
  // the original data type, but that's not correct because it would
  // still be using Prisma model types like Decimal.
  //
  // This would inevitably cause conflicts the the inferred type here
  // clashes with the actual Product type as defined in the types folder.
  //
  // The safest approach is to simply allow it to continue to be unknown then check it
  // with a typeguard when consuming. Alternatively, you can typecast it here.
  // Just make sure it is, in fact, giving you back the data as you typecast it.
  //
  // It's unfortunate that Prisma doesn't have a built-in method like toObject() that
  // would just give you back the data, and preserve/convert the types.
  //
  // Update, now that we're using import { prisma } from '@/db/prisma', both
  // price and rating are converted to strings and this is reflected in the
  // inferred data type. In theory, this could mean that we no longer need the
  // serializeData() function. However, there are other properties on the data
  // prototype that will still cause issues. // ? - Maybe if we used structuredClone() instead?
  //
  //   Only plain objects can be passed to Client Components from Server Components.
  //   Objects with symbol properties like nodejs.util.inspect.custom are not supported.
  //
  ///////////////////////////////////////////////////////////////////////////

  const serialized = serializeData(data)
  return serialized
}

/* ======================

====================== */
// Get single product by it's slug.

export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug }
  })
}

/* ======================

====================== */

// Get single product by it's ID
// export async function getProductById(productId: string) {
//   const data = await prisma.product.findFirst({
//     where: { id: productId }
//   })

//   return convertToPlainObject(data)
// }

/* ======================

====================== */
// Get all products

// export async function getAllProducts({
//   query,
//   limit = PAGE_SIZE,
//   page,
//   category,
//   price,
//   rating,
//   sort
// }: {
//   query: string
//   limit?: number
//   page: number
//   category?: string
//   price?: string
//   rating?: string
//   sort?: string
// }) {
//   // Query filter
//   const queryFilter: Prisma.ProductWhereInput =
//     query && query !== 'all'
//       ? {
//           name: {
//             contains: query,
//             mode: 'insensitive'
//           } as Prisma.StringFilter
//         }
//       : {}

//   // Category filter
//   const categoryFilter = category && category !== 'all' ? { category } : {}

//   // Price filter
//   const priceFilter: Prisma.ProductWhereInput =
//     price && price !== 'all'
//       ? {
//           price: {
//             gte: Number(price.split('-')[0]),
//             lte: Number(price.split('-')[1])
//           }
//         }
//       : {}

//   // Rating filter
//   const ratingFilter =
//     rating && rating !== 'all'
//       ? {
//           rating: {
//             gte: Number(rating)
//           }
//         }
//       : {}

//   const data = await prisma.product.findMany({
//     where: {
//       ...queryFilter,
//       ...categoryFilter,
//       ...priceFilter,
//       ...ratingFilter
//     },
//     orderBy:
//       sort === 'lowest'
//         ? { price: 'asc' }
//         : sort === 'highest'
//           ? { price: 'desc' }
//           : sort === 'rating'
//             ? { rating: 'desc' }
//             : { createdAt: 'desc' },
//     skip: (page - 1) * limit,
//     take: limit
//   })

//   const dataCount = await prisma.product.count()

//   return {
//     data,
//     totalPages: Math.ceil(dataCount / limit)
//   }
// }

/* ======================

====================== */
// Delete a product

// export async function deleteProduct(id: string) {
//   try {
//     const productExists = await prisma.product.findFirst({
//       where: { id }
//     })

//     if (!productExists) throw new Error('Product not found')

//     await prisma.product.delete({ where: { id } })

//     revalidatePath('/admin/products')

//     return {
//       success: true,
//       message: 'Product deleted successfully'
//     }
//   } catch (error) {
//     return { success: false, message: formatError(error) }
//   }
// }

/* ======================

====================== */
// Create a product

// export async function createProduct(data: z.infer<typeof insertProductSchema>) {
//   try {
//     const product = insertProductSchema.parse(data)
//     await prisma.product.create({ data: product })

//     revalidatePath('/admin/products')

//     return {
//       success: true,
//       message: 'Product created successfully'
//     }
//   } catch (error) {
//     return { success: false, message: formatError(error) }
//   }
// }

/* ======================

====================== */
// Update a product

// export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
//   try {
//     const product = updateProductSchema.parse(data)
//     const productExists = await prisma.product.findFirst({
//       where: { id: product.id }
//     })

//     if (!productExists) throw new Error('Product not found')

//     await prisma.product.update({
//       where: { id: product.id },
//       data: product
//     })

//     revalidatePath('/admin/products')

//     return {
//       success: true,
//       message: 'Product updated successfully'
//     }
//   } catch (error) {
//     return { success: false, message: formatError(error) }
//   }
// }

/* ======================

====================== */
// Get all categories

// export async function getAllCategories() {
//   const data = await prisma.product.groupBy({
//     by: ['category'],
//     _count: true
//   })

//   return data
// }

/* ======================

====================== */
// Get featured products

// export async function getFeaturedProducts() {
//   const data = await prisma.product.findMany({
//     where: { isFeatured: true },
//     orderBy: { createdAt: 'desc' },
//     take: 4
//   })

//   return convertToPlainObject(data)
// }
