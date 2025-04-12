/* ======================

====================== */
///////////////////////////////////////////////////////////////////////////
//
// This function is used to get around the Next.js serialization error that
// sometimes occurs when getting data from a database.
//
//   Only plain objects can be passed to Client Components from Server Components.
//
// This error could occur, for example, when a Prisma object is passed across the
// server/client boundary because some Prisma types are not serializable (e.g., Decimal).
// Additionally, some properties/methods on a Prisma object's prototype are not serializable.
//
// Brad Traversy does this:
//
//   export function serializeData<T>(value: T): T {
//     const parsedValue = JSON.parse(JSON.stringify(value))
//     return parsedValue as T
//   }
//
// The above implementation will give you back the exact same data type, which can be either
// a good thing or a bad thing. For example, in could give you back the a type that includes
// Prisma data types prior to serialization (i.e., Decimal). This would ultimately conflict
// with our actual Typescript types and ultimately lead to Typescript errors. In that case,
// it's better to use this version where the returned type is unknown:
//
//   export function serializeData(value: unknown) {
//     const parsedValue = JSON.parse(JSON.stringify(value))
//     return parsedValue
//   }
//
// Then in the server action or request controller, you can either leave it as unknown or
// typecast it as needed. However, in this application we're using a custom PrismaClient in
// src/db/prisma.ts. This client explicitly transforms certain properties to their serialized
// counterparts ahead of time, and these transformations ARE reflected in the inferred type of
// data: const data = await prisma.product.findMany({ ... })
//
// In practice, this means that it's best to use the version of serializeData() that bakes in generics,
// and gives us back the initial data type.
//
// Also looking superjson:
//
//   export const serializeData = <T>(value: T): T => {
//     return superjson.parse(superjson.stringify(value));
//   }
//
///////////////////////////////////////////////////////////////////////////

export function serializeData<T>(value: T): T {
  const parsedValue = JSON.parse(JSON.stringify(value))
  return parsedValue as T
}
