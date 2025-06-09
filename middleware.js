import { useParams } from 'next/navigation';
import { NextResponse } from 'next/server'

export function middleware(request) {
  // console.log('Middleware executed for:', request.nextUrl.pathname)
   return new NextResponse('Middleware is working!')
  const { lang: locale } = useParams()

  const { pathname } = request.nextUrl
  const userRole = request.cookies.get('userRole')?.value

  const isAdminRoute = pathname.startsWith('/en/admin')

  if (isAdminRoute && userRole !== 'admin') {
    // Redirect non-admin users to the /no-access page
    return NextResponse.redirect(new URL('/no-access', request.url))
  }

  // Allow the request
  return NextResponse.next()
}

// Match only /en/admin routes
export const config = {
  matcher: '/:path*',
}
