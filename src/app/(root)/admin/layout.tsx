import { redirect } from 'next/navigation'
import { auth } from '@/auth'

/* ========================================================================
                                AdminLayout
======================================================================== */
// Note: Next.js currently has an experimental forbidden.tsx file:
// https://nextjs.org/docs/app/api-reference/functions/forbidden
// https://nextjs.org/docs/app/api-reference/file-conventions/forbidden
// That said, we can also just implement similar logic ourselves.

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  const user = session?.user
  const isAdmin = user && user?.role === 'admin'

  if (!isAdmin) {
    redirect('/forbidden')
  }

  return children
}
