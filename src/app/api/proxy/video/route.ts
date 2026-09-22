import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/flickreels";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playletId = searchParams.get("playletId");
    const episodeNumberRaw = searchParams.get("episodeNumber");

    if (!playletId || !episodeNumberRaw) {
      return encryptedResponse(
        { success: false, error: "playletId and episodeNumber are required" },
        400
      );
    }

    // Convert episodeNumber ke angka murni untuk mencegah bug di API upstream
    const episodeNum = parseInt(episodeNumberRaw, 10);

    const response = await fetch(
      `${UPSTREAM_API}/get-episode?playlet_id=${playletId}&episodeNumber=${episodeNum}`,
      { 
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }
      }
    );

    if (!response.ok) {
      return encryptedResponse(
        { success: false, error: "Failed to fetch episode" },
        response.status
      );
    }

    const data = await safeJson<any>(response);
    const ep = data?.data || data?.result || data;

    if (!ep) {
      return encryptedResponse(
        { success: false, error: "Episode not found" },
        404
      );
    }

    // Ambil URL video langsung dari berbagai variasi property response API upstream
    const rawHlsUrl = ep.hls_url || ep.hlsUrl || ep.video_url || ep.stream_url || "";

    return encryptedResponse({
      success: true,
      playletId: playletId,
      title: ep.playlet_title || ep.title || "",
      episodeTitle: ep.chapter_title || ep.episodeTitle || "",
      episodeNumber: ep.chapter_num || episodeNum,
      totalDuration: ep.total_duration || ep.duration || 0,
      // 🚀 KIRIM URL ASLI SANGAT PENTING DENGAN FALLBACK AGAR TIDAK MACET SAAT NEXT EPISODE
      hlsUrl: rawHlsUrl,
    });
  } catch (error) {
    console.error("FlickReels Episode Error:", error);
    return encryptedResponse(
      { success: false, error: "Internal server error" },
      500
    );
  }
}
