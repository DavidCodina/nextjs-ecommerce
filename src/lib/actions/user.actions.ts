'use server'

import {
  // shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema
  // paymentMethodSchema,
  // updateUserSchema
} from '../validators'

import {
  // auth,
  signIn
  // signOut
} from '@/auth'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

import { prisma } from '@/db/prisma'
import { formatError } from '@/utils'
// import { ShippingAddress } from '@/types'
// import { z } from 'zod'
// import { PAGE_SIZE } from '../constants'
// import { revalidatePath } from 'next/cache'
// import { Prisma } from '@prisma/client'
// import { getMyCart } from './cart.actions'

//! For whatever reason, he doesn't use hashSync in the final version.
//! import { hashSync } from 'bcrypt-ts-edge'
import { hash } from '../encrypt'
/* ======================

====================== */
// Sign in the user with credentials

//# Change this so it's not using formData
//# Also, I think this functio is supposed preemptively catch errors to send back to client.
//# Simialar to what authorize() does.
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password')
    })

    ///////////////////////////////////////////////////////////////////////////
    //
    // What happens if the associated authorize() throws an error?
    // A CallbackRouteError is triggered. However, this error does not expose the
    // original message. This behavior is actually intentional in NextAuth.js v5.
    // The CallbackRouteError is a generic error wrapper that does not expose the
    // original error message thrown inside the authorize function. This was introduced
    // to prevent leaking sensitive information to the client, such as specific
    // authentication failure reasons. That said, if you look in the Terminal, you
    // can still see the original error message, which may be useful for debugging..
    //
    //   [auth][cause]: Error: Test throwing errror! You did a bad thing!
    //
    // Returning null in authorize() instead of throwing an error is still a valid approach.
    // In this case, a CredentialsSignin error is generated, but practically there's no difference
    // except now there's not even a specific [auth][cause] message logged in the Terminal console.
    //
    // If you really need the original error message, there are two workarounds for this. We can
    // create a custom error and throw that instead in auth.ts: throw new InvalidLoginError().
    //
    // Aternatively, since 2022 (Node v16), there's an optional cause property on Error. This
    // is usually undefined by default, but it seems that  Auth.js sets a cause of { err, provider },
    // where err is the original error. Thus, we can still get the original error from err.cause.err.message.
    // Note: this approach ONLY is reliable  in Node and not browser javascript.
    //
    ///////////////////////////////////////////////////////////////////////////

    // The awaited return of signIn() is type never, and gives you nothing back.
    await signIn('credentials', user)

    return { success: true, message: 'Signed in successfully' }
  } catch (err) {
    if (isRedirectError(err)) {
      throw err
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    // if (err instanceof Error) {
    //   let originalMessage = ''
    //
    //   if (
    //     err.cause &&
    //     typeof err.cause === 'object' &&
    //     'err' in err.cause &&
    //     err.cause.err instanceof Error
    //   ) {
    //     originalMessage = err.cause.err.message
    //   }
    //
    //   console.log({
    //     name: err.name,
    //     message: err.message,
    //     originalMessage
    //   })
    // }
    //
    ///////////////////////////////////////////////////////////////////////////

    //# Normalize all returns...
    return { success: false, message: 'Invalid email or password' }
  }
}

/* ======================

====================== */
// Sign user out
//# I switched to using a client-side signOut() inside the Sidebar.
//# However, there's other logic here that we'll eventually need to implement
//# in conjunction with signing out. At that point, it may make more sense
//# to switch back to a server action.

// export async function signOutUser() {
//   // get current users cart and delete it so it does not persist to next user
//    const currentCart = await getMyCart()
// if (currentCart?.id) {
//   await prisma.cart.delete({ where: { id: currentCart.id } })
// } else {
//   console.warn('No cart found for deletion.')
// }
//   await signOut()
// }

/* ======================

====================== */
// Sign up user

export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    //! He's not using safeParse here.
    //! Instead, he lets potential zod errors go straight to the catch block,
    //! then uses formatError() to check if they are ZodError then formats them,etc.
    //! That approach is too convoluted. Plus, it's all going into the message property.
    //! This whole thing needs to be refactored so that there is a normalized return from
    //! all server actions, including a potential errors property.

    const user = signUpFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    })

    //! We should also be checking for a preexisting email.
    //! What currently happens? Probably an error is generated from
    //! Prisma that a uniqueness constraint is violated:
    //!
    //!   Unique constraint failed on the fields: (`email`)
    //!
    //! However, it's better to handle it preemptively.
    //! Currently Brad has a super hacky way of handling this
    //! in the formatError() utility function.

    const plainPassword = user.password

    //! user.password = await hashSync(user.password)
    user.password = await hash(user.password)

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password
      }
    })

    await signIn('credentials', {
      email: user.email,
      password: plainPassword
    })

    return { success: true, message: 'User registered successfully' }
  } catch (err) {
    if (isRedirectError(err)) {
      throw err
    }

    console.log(err)

    //# formatError is created in section 4 in the second to last tutorial.
    //# Ultimately, I'm going to get rid of it.
    return { success: false, message: formatError(err) }
  }
}

/* ======================

====================== */
// Get user by the ID

// export async function getUserById(userId: string) {
//   const user = await prisma.user.findFirst({
//     where: { id: userId }
//   })
//   if (!user) throw new Error('User not found')
//   return user
// }

/* ======================

====================== */
// Update the user's address

// export async function updateUserAddress(data: ShippingAddress) {
//   try {
//     const session = await auth()

//     const currentUser = await prisma.user.findFirst({
//       where: { id: session?.user?.id }
//     })

//     if (!currentUser) throw new Error('User not found')

//     const address = shippingAddressSchema.parse(data)

//     await prisma.user.update({
//       where: { id: currentUser.id },
//       data: { address }
//     })

//     return {
//       success: true,
//       message: 'User updated successfully'
//     }
//   } catch (error) {
//     return { success: false, message: formatError(error) }
//   }
// }

/* ======================

====================== */
// Update user's payment method

// export async function updateUserPaymentMethod(
//   data: z.infer<typeof paymentMethodSchema>
// ) {
//   try {
//     const session = await auth()
//     const currentUser = await prisma.user.findFirst({
//       where: { id: session?.user?.id }
//     })

//     if (!currentUser) throw new Error('User not found')

//     const paymentMethod = paymentMethodSchema.parse(data)

//     await prisma.user.update({
//       where: { id: currentUser.id },
//       data: { paymentMethod: paymentMethod.type }
//     })

//     return {
//       success: true,
//       message: 'User updated successfully'
//     }
//   } catch (error) {
//     return { success: false, message: formatError(error) }
//   }
// }

/* ======================

====================== */
// Update the user profile

// export async function updateProfile(user: { name: string; email: string }) {
//   try {
//     const session = await auth()

//     const currentUser = await prisma.user.findFirst({
//       where: {
//         id: session?.user?.id
//       }
//     })

//     if (!currentUser) throw new Error('User not found')

//     await prisma.user.update({
//       where: {
//         id: currentUser.id
//       },
//       data: {
//         name: user.name
//       }
//     })

//     return {
//       success: true,
//       message: 'User updated successfully'
//     }
//   } catch (error) {
//     return { success: false, message: formatError(error) }
//   }
// }

/* ======================

====================== */
// Get all the users

// export async function getAllUsers({
//   limit = PAGE_SIZE,
//   page,
//   query
// }: {
//   limit?: number
//   page: number
//   query: string
// }) {
//   const queryFilter: Prisma.UserWhereInput =
//     query && query !== 'all'
//       ? {
//           name: {
//             contains: query,
//             mode: 'insensitive'
//           } as Prisma.StringFilter
//         }
//       : {}

//   const data = await prisma.user.findMany({
//     where: {
//       ...queryFilter
//     },
//     orderBy: { createdAt: 'desc' },
//     take: limit,
//     skip: (page - 1) * limit
//   })

//   const dataCount = await prisma.user.count()

//   return {
//     data,
//     totalPages: Math.ceil(dataCount / limit)
//   }
// }

/* ======================

====================== */
// Delete a user

// export async function deleteUser(id: string) {
//   try {
//     await prisma.user.delete({ where: { id } })

//     revalidatePath('/admin/users')

//     return {
//       success: true,
//       message: 'User deleted successfully'
//     }
//   } catch (error) {
//     return {
//       success: false,
//       message: formatError(error)
//     }
//   }
// }

/* ======================

====================== */
// Update a user

// export async function updateUser(user: z.infer<typeof updateUserSchema>) {
//   try {
//     await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         name: user.name,
//         role: user.role
//       }
//     })

//     revalidatePath('/admin/users')

//     return {
//       success: true,
//       message: 'User updated successfully'
//     }
//   } catch (error) {
//     return { success: false, message: formatError(error) }
//   }
// }
