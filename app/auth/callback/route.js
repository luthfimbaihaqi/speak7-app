import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 🔥 TAMBAHAN WAJIB: Agar Next.js tidak men-cache route ini
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/';

    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Tukar "Code" dari email menjadi "Session"
      await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirect ke halaman tujuan
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
    
  } catch (error) {
    // Jaga-jaga kalau error, kembalikan ke home biar ga blank
    console.error('Callback Error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}