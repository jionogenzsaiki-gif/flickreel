import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");

  if (!urlParam) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    // 🚀 LANGSUNG REDIRECT KE CDN ASLI
    // Vercel hanya memproses header (beberapa Byte), TIDAK MENGUNDUH VIDEO!
    return NextResponse.redirect(urlParam, 302);
  } catch (error) {
    return new Response(`Redirect error: ${error}`, { status: 500 });
  }
}
