import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Tukar "Code" dari email menjadi "Session" (Login otomatis)
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect user ke halaman tujuan (update-password)
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}