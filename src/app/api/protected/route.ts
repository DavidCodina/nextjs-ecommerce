// https://authjs.dev/getting-started/session-management/protecting
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers

// import { NextRequest, NextResponse } from 'next/server'
// import { auth } from '@/auth'

///////////////////////////////////////////////////////////////////////////
//
// This route is automatically protected by the middleware.ts implementation:
//
//   if (!isLoggedIn && !isPublicRoute) {
//     if (nextUrl.pathname.startsWith('/api')) {
//       return new Response(
//         JSON.stringify({ data: null, message: 'Not authorized.', success: false}),
//         {
//           status: 401,
//           headers: {
//             'Content-Type': 'application/json; charset=utf-8',
//             'Cache-Control': 'no-store'
//           }
//         }
//       )
//     }
//   }
//
///////////////////////////////////////////////////////////////////////////

export function GET(_request: Request, _context: any) {
  try {
    // Response.json() is only valid from TypeScript 5.2. If you use a lower
    // TypeScript version, you can use NextResponse.json() for typed responses instead.
    return Response.json({
      data: 'You accessed the protected route!',
      message: 'Success',
      success: false
    })
  } catch (_err) {
    // This should be updated to
    // return NextResponse.json()
    return new Response(
      JSON.stringify({
        data: null,
        message: 'Server error.',
        success: false
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store'
        }
      }
    )
  }
}

/* Assuming the middleware didn't set up route protection, then we could do this
instead. Or we could use this kind of implementation to perform additional role-based 
authorization checks. Notice that below I'm using two different approaches to setting 
the status code. Either way works. */

// export const GET = auth(function GET(request, _context: any) {
//   if (!request.auth) {
//     return NextResponse.json(
//       { data: null, message: 'Not authorized.', success: false },
//       { status: 401 }
//     )
//   }

//   try {
//     return Response.json({
//       data: 'You accessed the protected route!',
//       message: 'Success',
//       success: false
//     })
//   } catch (_err) {
//     return new Response(
//       JSON.stringify({ data: null, message: 'Server error.', success: false }),
//       {
//         status: 500,
//         headers: {
//           'Content-Type': 'application/json; charset=utf-8',
//           'Cache-Control': 'no-store'
//         }
//       }
//     )
//   }
// })
