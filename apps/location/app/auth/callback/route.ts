import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/'
  const basePath = '/location'
  const next = nextParam.startsWith(basePath) ? nextParam : `${basePath}${nextParam === '/' ? '' : nextParam}`

  // Safe origin resolution to avoid 0.0.0.0 redirects in dev environments
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3007'
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  let safeOrigin = `${protocol}://${host}`
  if (safeOrigin.includes('0.0.0.0')) {
    safeOrigin = safeOrigin.replace('0.0.0.0', 'localhost')
  }

  const redirectTo = `${safeOrigin}${next}`

  if (code) {
    const supabaseResponse = NextResponse.redirect(redirectTo)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }))
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    console.log('Auth callback: exchanging code for session...', { code: code.substring(0, 10) + '...' })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      console.log('Auth callback: session exchanged successfully for', data.user?.email)
      return supabaseResponse
    } else {
      console.error('Auth callback: error during exchangeCodeForSession:', error.message, error)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}${basePath}/login?error=Could not authenticate user`)
}
