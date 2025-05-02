// https://authjs.dev/reference/nextjs#in-middleware
// https://nextjs.org/docs/app/building-your-application/routing/middleware

///////////////////////////////////////////////////////////////////////////
//
// Should we implement route protections here, or should we do it directly
// within the page itself?
//
// See here at 58:00 : https://www.youtube.com/watch?v=bMYZSi_LZ2w
// Apparently, Vercel warns against using middleware for auth checks.
//
// According to AI:
//
//   The recommendation to avoid setting up route protection
//   logic in middleware and instead implementing it directly in the page comes
//   from the consideration of performance and simplicity.
//
//   The idea is that by handling route protection within the page itself, you can avoid
//   the overhead that might come with middleware, which could potentially affect every
//   request to your server. This approach also aligns with the philosophy of keeping
//   functionality close to where it’s used, which can make your code easier to understand
//   and maintain.
//
//   While I couldn’t find a direct statement from the Next.js documentation advising against
//   middleware for route protection, the general guidance and examples provided in the
//   documentation and community resources tend to favor the page-level implementation.
//
// Gotcha: middleware runs before the next-auth callbacks, so
// we won't have access to the extended user. This means we would
// have to interact with the database here in order to get role,
// and do admin protection logic. However, you can't interact with
// the database in middleware.
//
// Or can you? Normally, you would see an error in the console,
// even in development:
//
//   Error: PrismaClient is not configured to run in Vercel Edge Functions or Edge Middleware.
//
// In the following ByteGrad tutorial at 1:12:00 https://www.youtube.com/watch?v=QXxy8Uv1LnQ ,
// he shows how to make this possible using a driver adapter, and I believe that's what we're
// doing when we set up our custom PrismaClient.

// Mahmoud also discusses the serverless driver and it's Edge capabilities in
// Serverless Postgres at 43:30: https://www.youtube.com/watch?v=RaO9m8a_3ug&t=2101s
//
//^ If this is true, then it means that prisma can be used here as well as in the
//^ CredentialsProvider when CredentialsProvider is inside of auth.config.ts.
//# As a first step, try making a random db call here to see what happens.
//
// The alternative would be to create a layout.tsx that wraps all
// admin pages, and performs the necessary roles-based authentication.
//
// Code with Antonio does an admin example here at 6:30:00 :
// https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s
// It's important to note that his tutorial is the one that was advocating
// in favor of using middleware for route protection, and he still does this
// locally in an admin page:
//
//   const session = await auth()
//   const user    = session?.user
//   const isAdmin = user && user?.roles?.includes('admin')
//   if (!isAdmin) { redirect('/forbidden') }
//
///////////////////////////////////////////////////////////////////////////
import NextAuth from 'next-auth'
import { authConfig } from 'auth.config'

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes
} from '@/routes'

// In this video at 13:00 he indicates that the middleware will keep the session alive.
// https://www.youtube.com/watch?v=bMYZSi_LZ2w
const { auth } = NextAuth(authConfig)

/* ========================================================================

======================================================================== */
///////////////////////////////////////////////////////////////////////////
//
// This app will be protected by default.
// Why? Because you generally have fewer public routes than private routes.
// See Code With Antonio at 2:17:00 : https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s
//
/////////////////////////
//
// https://authjs.dev/guides/edge-compatibility
// By default, on Vercel and other hosting providers, Middleware code always runs in an edge runtime.
// TL;DR: We need to separate out parts of auth.ts into auth.config.ts.
//
///////////////////////////////////////////////////////////////////////////
export default auth((req) => {
  // All of this was implemented at 2:31:00 in Code With Antonio
  // https://www.youtube.com/watch?v=1MTyCvS05V4&t=1s
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix) // '/api/auth'
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  // If it's an API auth route, then always allow it. This
  // entails any route that begins with '/api/auth'.
  if (isApiAuthRoute) {
    return
  }

  // However, if the user is already logged in, then there's no reason for them
  // to be accessing an auth route, so redirect to DEFAULT_LOGIN_REDIRECT.
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return
  }

  // If the user is NOT logged in and the route is NOT public, then...
  // Code With Antionio at 2:35:00.
  if (!isLoggedIn && !isPublicRoute) {
    // https://authjs.dev/getting-started/session-management/protecting?framework=express#nextjs-middleware
    // With Next.js 12+, the easiest way to protect a set of pages is using the middleware file.
    if (nextUrl.pathname.startsWith('/api')) {
      return new Response(
        JSON.stringify({
          data: null,
          message: 'Not authorized.',
          success: false
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    if (nextUrl.search) {
      ///////////////////////////////////////////////////////////////////////////
      //
      // When signing out, 'logout=true' is set in the query string.
      // This is set in AppSidebar's 'Sign Out' button:
      //
      //   onClick={() => {
      //     const searchParams = new URLSearchParams(window.location.search)
      //     searchParams.set('logout', 'true')
      //     window.history.replaceState(null, '',`?${searchParams.toString()}`)
      //     signOut({ redirect: true })
      //   }}
      //
      // We can use the presence of this search param to opt out of assiging a callbackUrl.
      //
      // When you’re performing a redirect within the middleware, including nextUrl as the base in the new URL()
      // constructor ensures that the redirect maintains the same host and protocol as the original request.
      // This has the added benefit of preventing public routes from being used as callbackUrls.
      // Why? Because users are never redirected to '/login' from a public route.
      //
      ///////////////////////////////////////////////////////////////////////////

      if (nextUrl.search.includes('logout=true')) {
        return Response.redirect(new URL(`/login`, nextUrl))
      }
    }

    // This is the logic for automatically assigning the callbackUrl.
    const callbackUrl = nextUrl.pathname
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)

    const otherSearchParams = nextUrl.search
      ? `&${nextUrl.search.slice(1)}`
      : ''

    return Response.redirect(
      new URL(
        `/login?callbackUrl=${encodedCallbackUrl}${otherSearchParams}`,
        nextUrl
      )
    )
  }

  // Otherwise, return.
  return
})

export const config = {
  // https://clerk.com/docs/quickstarts/nextjs?utm_medium=youtube&utm_source=sponsorship&utm_content=12-31-2023&utm_campaign=code-with-antonio#require-authentication-to-access-your-app
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
}
