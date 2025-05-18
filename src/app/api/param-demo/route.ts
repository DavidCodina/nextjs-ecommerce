import { NextRequest /*, NextResponse */ } from 'next/server'
// import { headers } from 'next/headers'
import { cookies } from 'next/headers'

// This is no longer necessary in v15.
// export const dynamic = 'force-dynamic'

/* ========================================================================

======================================================================== */
// This demo looks at:
//
//   1. Getting query params.
//   2. Getting/Setting headers.
//   3. Getting/Setting cookies.

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  // Usage: http://localhost:3000/api/param-demo?test=abc123
  const test = searchParams.get('test')

  // Getting cookie approach 1:
  // In Postman createa cookie: testCookie=myTestCookie; Path=/; Expires=Sun, 18 Jan 2026 18:23:17 GMT;
  // const cookies = request.cookies
  // const testCookie = cookies.get('testCookie') // => { "name": "testCookie", "value": "myTestCookie" }

  // Getting cookeis approach 2:
  const cookieStore = await cookies()
  const testCookie = cookieStore.get('testCookie') // =>  { name: 'testCookie', value: 'myTestCookie', path: '/' }

  ///////////////////////////////////////////////////////////////////////////
  //
  // Get headers approach 1:
  //
  // console.log(request.headers)
  //
  // Headers {
  //   'user-agent': 'PostmanRuntime/7.43.0',
  //   accept: '*/*',
  //   'postman-token': '79e80d2a-8240-4c80-a4be-a6c1d17fca12',
  //   host: 'localhost:3000',
  //   'accept-encoding': 'gzip, deflate, br',
  //   connection: 'keep-alive',
  //   'x-forwarded-host': 'localhost:3000',
  //   'x-forwarded-port': '3000',
  //   'x-forwarded-proto': 'http',
  //   'x-forwarded-for': '::1',
  //   'x-pathname': '/api/param-demo'
  // }
  //
  // Cloning: If you need to modify the headers or create a copy of them without affecting
  // the original, wrapping them in new Headers(...) creates a new instance.
  // const headersCopy = new Headers(request.headers)
  //
  /////////////////////////
  //
  // Get headers approach 2:
  //
  // const headersList = await headers()
  // Note: headersList can't be logged directly.
  //
  //   ❌
  //   console.log(`\nheaders:`)
  //   TypeError: Cannot read private member #headersList from an object whose class did not declare it
  //
  //   ✅
  //   headersList.forEach((value, key) => {  console.log(`${key}: ${value}`) })
  //
  //   ✅
  //   const headersObj = Object.fromEntries(headersList.entries())
  //   console.log(headersObj)
  //
  ///////////////////////////////////////////////////////////////////////////

  return Response.json(
    {
      data: {
        test: test,
        testCookie
      },
      message: 'Success',
      success: true
    },
    {
      status: 200,
      headers: {
        'x-custom-header': 'abc123',
        'Set-Cookie': 'responseCookie=abc123; Path=/api; Max-Age=3600'
      }
    }
  )
}
