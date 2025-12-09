import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Ambil titipan "next", kalau tidak ada default ke Home ('/')
  const next = searchParams.get('next') ?? '/'

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
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )
    
    // Tukar "Code" dari email menjadi "Session" user
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // --- LOGIKA REDIRECT SUKSES ---
      const forwardedHost = request.headers.get('x-forwarded-host') // Load balancer check
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // Jika berhasil, arahkan user ke halaman tujuan (misal: /update-password)
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      // --- DEBUGGING: TAMPILKAN ERROR DI TERMINAL ---
      console.error("🔥 AUTH ERROR di Callback (Exchange Code Gagal):", error.message)
    }
  } else {
    // Jika tidak ada code di URL
    console.error("🔥 AUTH ERROR di Callback: Parameter 'code' tidak ditemukan di URL.")
  }

  // Jika gagal, lempar ke halaman error
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}