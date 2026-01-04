import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') 
  
  // Default ke Home
  let next = searchParams.get('next') ?? '/'

  // --- LOGIKA PINTAR (FORCE REDIRECT) ---
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
    
    // 🔥 UPDATE: Kita ambil 'data' dari response untuk dicek
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // --- LOGIKA DETEKSI USER BARU ---
      if (data?.user) {
          // Ambil waktu pembuatan user & waktu sekarang
          const createdAt = new Date(data.user.created_at).getTime();
          const now = Date.now();
          
          // Jika user dibuat kurang dari 30 detik yang lalu, anggap USER BARU
          const isNewUser = (now - createdAt) < 30 * 1000; 

          if (isNewUser) {
              // Tempelkan parameter welcome=true ke URL tujuan
              // Cek dulu apakah 'next' sudah punya tanda tanya (?)
              const separator = next.includes('?') ? '&' : '?';
              next = `${next}${separator}welcome=true`;
          }
      }
      // ---------------------------------

      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // Susun URL Tujuan Akhir dengan 'next' yang mungkin sudah diubah
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