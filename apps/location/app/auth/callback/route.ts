import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/'
  const basePath = '/location'
  const next = nextParam.startsWith(basePath) ? nextParam : `${basePath}${nextParam === '/' ? '' : nextParam}`

  // 1. Check if the client passed an explicit origin in the query parameters (useful behind reverse proxies)
  const queryOrigin = searchParams.get('origin')
  let safeOrigin = ''
  
  if (queryOrigin) {
    try {
      const parsedUrl = new URL(queryOrigin)
      const hostname = parsedUrl.hostname
      const isAllowed = ['artefacturbain.ca', 'localhost', '127.0.0.1'].some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      ) || hostname.endsWith('.vercel.app')
      
      if (isAllowed) {
        safeOrigin = parsedUrl.origin
      }
    } catch (e) {
      console.error('Invalid origin parameter:', queryOrigin, e)
    }
  }

  // 2. Fall back to headers if no valid queryOrigin was provided
  if (!safeOrigin) {
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host') || 'localhost:3007'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    safeOrigin = `${protocol}://${host}`
    if (safeOrigin.includes('0.0.0.0')) {
      safeOrigin = safeOrigin.replace('0.0.0.0', 'localhost')
    }
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
  return NextResponse.redirect(`${safeOrigin}${basePath}/login?error=Could not authenticate user`)
}
