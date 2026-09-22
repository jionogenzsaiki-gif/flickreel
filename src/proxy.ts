import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Store in-memory untuk rate limit
const rateLimit = new Map<string, { count: number; startTime: number }>();

export function middleware(request: NextRequest) {
  // Ambil IP pengguna dari header proxy (Vercel/Cloudflare)
  const forwardedFor = request.headers.get('x-forwarded-for');
  let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  
  if (ip === '::1' || !ip) {
    ip = '127.0.0.1';
  }

  const limit = 150; // Maksimal 150 request
  const windowMs = 60 * 1000; // Window 1 menit (60.000 ms)
  const now = Date.now();

  // Pembersihan otomatis memori untuk IP yang expired (cegah memory leak)
  if (rateLimit.size > 1000) {
    for (const [key, value] of rateLimit.entries()) {
      if (now - value.startTime > windowMs) {
        rateLimit.delete(key);
      }
    }
  }

  // Cek atau buat record rate limit untuk IP saat ini
  const record = rateLimit.get(ip);

  if (!record || now - record.startTime > windowMs) {
    rateLimit.set(ip, { count: 1, startTime: now });
  } else {
    record.count++;
    
    // Jika melebihi batas request
    if (record.count > limit) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Too Many Requests',
          error: 'Terlalu banyak permintaan. Mohon tunggu sebentar.'
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          } 
        }
      );
    }
  }

  return NextResponse.next();
}

// Matcher: Hanya mengeksekusi middleware untuk semua endpoint /api/
export const config = {
  matcher: '/api/:path*',
};
