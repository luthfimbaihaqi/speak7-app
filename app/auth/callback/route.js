import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Deteksi apakah ini login biasa atau reset password?
  const type = searchParams.get('type') 
  
  // Default ke Home
  let next = searchParams.get('next') ?? '/'

  // --- LOGIKA PINTAR (FORCE REDIRECT) ---
  // Kalau tipe-nya 'recovery', kita PAKSA tujuannya ke update-password
  // Tidak peduli apa kata parameter 'next'
  if (type === 'recovery') {
    next = '/update-password'
  }

  if (code) {
    const cookieStore = await import('next/headers').then(mod => mod.cookies())
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
            }
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // Susun URL Tujuan Akhir
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error("🔥 AUTH ERROR di Callback:", error.message)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}