import { Database } from "@clicker/game/types"
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the auth token if needed
  await supabase.auth.getUser()

  // Optional: Add logic to protect certain routes
  // if (!user && request.nextUrl.pathname.startsWith("/protected")) {
  //   return NextResponse.redirect(new URL("/login", request.url))
  // }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /rest/v1 (Supabase API)
     * - /auth/v1 (Supabase Auth)
     * - /realtime/v1 (Supabase Realtime)
     * - /storage/v1 (Supabase Storage)
     */
    "/((?!_next/static|_next/image|favicon.ico|rest/v1|auth/v1|realtime/v1|storage/v1|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
