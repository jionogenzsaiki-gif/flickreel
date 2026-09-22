import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory store for rate limiting
const rateLimit = new Map<string, { count: number; startTime: number }>();

export function middleware(request: NextRequest) {
  // Hanya jalankan rate limiting untuk endpoint /api
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Identifikasi IP pengguna
  let ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  if (ip === '::1') ip = '127.0.0.1';

  const limit = 150; // Batas request per window
  const windowMs = 60 * 1000; // Window 1 menit

  const now = Date.now();

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 0, startTime: now });
  }

  const data = rateLimit.get(ip)!;

  // Reset window jika waktu window sudah berlalu
  if (now - data.startTime > windowMs) {
    data.count = 0;
    data.startTime = now;
  }

  data.count++;

  // Cek apakah melampaui batas
  if (data.count > limit) {
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Too Many Requests',
        error: "Terlalu banyak permintaan. Mohon tunggu sebentar."
      }),
      { 
        status: 429, 
        headers: { 
          'content-type': 'application/json',
          'Retry-After': '60'
        } 
      }
    );
  }

  return NextResponse.next();
}

// Konfigurasi matcher
export const config = {
  matcher: '/api/:path*',
};
