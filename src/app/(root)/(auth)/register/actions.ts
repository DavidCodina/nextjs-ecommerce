'use server'

//# import { generateVerificationToken } from 'lib/tokens'
//# import { sendVerificationEmail } from 'lib/mail'

//! For whatever reason, Brad doesn't use hashSync in the final version.
//! import { hashSync } from 'bcrypt-ts-edge'. Note also that
//! When you deploy a Next.js app to Vercel, it does not automatically
//! By default, Next.js API routes and server-side rendering (SSR) run in serverless
//! functions, which are deployed to Vercel’s infrastructure but not necessarily at the edge.

//! See here also:
//! https://authjs.dev/guides/edge-compatibility

import { hash } from '@/lib/encrypt'
import { prisma } from '@/db/prisma'

type RegisterResponse = {
  data: any //! Temporary any
  errors?: Record<string, string> | null
  message: string
  success: boolean
}

/* ========================================================================

======================================================================== */

export const register = async ({
  name,
  email,
  password,
  confirmPassword
}: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): Promise<RegisterResponse> => {
  try {
    /* ======================
          Validation
    ====================== */

    const formErrors: Record<string, string> = {}

    if (!name || (typeof name === 'string' && name.trim() === '')) {
      formErrors.name = 'A name is required. (Server)'
    }

    const regex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (!email || (typeof email === 'string' && email.trim() === '')) {
      formErrors.email = 'An email is required. (Server)'
    } else if (!regex.test(email)) {
      formErrors.email = 'A valid email is required. (Server)'
    } else {
      ///////////////////////////////////////////////////////////////////////////
      //
      // ⚠️ Case Sensitivity: https://www.prisma.io/docs/orm/prisma-client/queries/case-sensitivity
      //
      // Note: if email is 'DAVID@example.com' but 'david@example.com' alread exists, Prisma will
      // throw a PrismaClientKnownRequestError because the uniqueness constraint will have failed.
      // In other words, uniqueness is not case insensitive. Similarly, when querying for a user by
      // email it will also be case insensitive by default.
      //
      // Apparently, Prisma queries are case-insensitive by default.
      // While Prisma's query language itself is case-sensitive by default, the underlying database
      // and its configuration can sometimes lead to case-insensitive behavior for certain operations.
      // Thus if you did this in MySQL workbench:
      //
      //   SELECT * from users WHERE email = "DAVID@example.com";
      //
      // You would likely get back the record with email 'david@example.com'.
      // In the case of MySQL, the case sensitivity of string comparisons is determined by the collation
      // of the column. Collation is a set of rules that define how character data is sorted and compared.
      //
      // While we can rely on that default behavior, it's still a good practice to explicitly specify
      // case-insensitivity at the level of Prisma. That said, findUnique() doesn't support the `mode`
      // option, so you'll need to use findFirst() instead.
      //
      //  const existingUser = await prisma.user.findUnique({ where: { email }  })
      //
      ///////////////////////////////////////////////////////////////////////////
      const existingUser = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive'
          }
        }
      })

      if (existingUser) {
        formErrors.email = 'A user with that email already exists. (Server)' // 409 Conflict error
      }
    }

    if (typeof password !== 'string' || password.trim().length < 5) {
      formErrors.password = 'A password must be at least 5 characters. (Server)'
    }

    if (!confirmPassword || typeof confirmPassword !== 'string') {
      formErrors.confirmPassword =
        'The confirm password field is required. (Server)'
    } else if (password !== confirmPassword) {
      formErrors.confirmPassword = 'The passwords must match. (Server)'
    }

    if (Object.keys(formErrors).length > 0) {
      return {
        data: null,
        errors: formErrors,
        message: 'The form data is invalid.',
        success: false
      }
    }

    /* ======================
          Create User
    ====================== */

    const hashedPassword = await hash(password)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
        //^ Testing Only! Do this if you want to bypass the email verification checks,
        //^ but DO NOT leave this code here. COMMENT THIS OUT!!!
        //^ emailVerified: process.env.NODE_ENV === 'development' ? new Date() : null
      },
      select: {
        id: true,
        name: true,
        role: true
      }
    })

    /* ======================
    Send Verification Token
    ====================== */

    //# const verificationToken = await generateVerificationToken(email)

    ///////////////////////////////////////////////////////////////////////////
    //
    // {
    //   id: 'clrs2nxn30001ku5px6qi71xs',
    //   email: 'jerk@mail.com',
    //   token: '7c50149f-55e8-4790-a6d0-82c60137a1d5',
    //   expires: 2024-01-24T18:41:37.934Z
    // }
    //
    ///////////////////////////////////////////////////////////////////////////

    //# await sendVerificationEmail(
    //#   verificationToken.email,
    //#   verificationToken.token
    //# )

    /* ======================
           Response
    ====================== */

    return {
      data: null,
      errors: null,
      message: 'Registration success.', //# message: 'Confirmation email sent.',
      success: true
    }
  } catch (_err) {
    // if (err instanceof Error) {
    //   console.log({ name: err.name, message: err.message })
    // }
    return {
      data: null,
      message: 'Server error.',
      success: false
    }
  }
}
