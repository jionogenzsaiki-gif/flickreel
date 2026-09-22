"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useFlickReelsEpisode, useFlickReelsDetail } from "@/hooks/useFlickReels";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, List, Play, RefreshCw, X, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Hls from "hls.js";
import { getWatchSession, updateWatchSession } from "@/lib/watch-session";
import { addToHistory } from "@/lib/history";

interface QualityLevel {
  id: number;
  label: string;
  height: number;
}

function FlickReelsWatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const playletId = (params?.playletId as string) || "";
  const router = useRouter();

  const urlToken = searchParams.get("t") || "";
  const [currentToken, setCurrentToken] = useState(urlToken);
  const session = getWatchSession(currentToken);
  const [currentEpisode, setCurrentEpisode] = useState(session?.episodeNumber || 1);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  
  // State Resolusi Video
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!session && urlToken && playletId) {
      router.replace(`/detail/flickreels/${playletId}`);
    }
  }, [session, urlToken, playletId, router]);

  const { data: detailData } = useFlickReelsDetail(playletId);
  const { data: episodeData, isLoading, error, refetch } = useFlickReelsEpisode(playletId, currentEpisode);

  const totalEpisodes = detailData?.totalEpisodes || 1;
  const title = detailData?.title || episodeData?.title || "FlickReels Lite";
  const cover = detailData?.cover || "";
  const videoUrl = episodeData?.hlsUrl || null;

  // OTOMATIS SIMPAN KE RIWAYAT SAAT DITONTON
  useEffect(() => {
    if (playletId && title) {
      addToHistory({
        id: playletId,
        title: title,
        cover: cover,
        lastEpisode: currentEpisode,
      });
    }
  }, [playletId, title, cover, currentEpisode]);

  const handleVideoEnded = useCallback(() => {
    const nextEp = currentEpisode + 1;
    if (nextEp <= totalEpisodes) {
      setCurrentEpisode(nextEp);
      const newToken = updateWatchSession(currentToken, { episodeNumber: nextEp });
      setCurrentToken(newToken);
      window.history.replaceState(null, '', `/watch/flickreels/${playletId}?t=${newToken}`);
    }
  }, [currentEpisode, totalEpisodes, playletId, currentToken]);

  // Handle pemuatan, pembersihan cache, dan HLS resolution levels
  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;
    const video = videoRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();

    // Mencegah cache dengan menambahkan parameter timestamp pada URL
    const noCacheUrl = videoUrl.includes("?") 
      ? `${videoUrl}&_t=${Date.now()}` 
      : `${videoUrl}?_t=${Date.now()}`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        // DILARANG MENYIMPAN CACHE ATAU BUFFER PANJANG
        maxBufferLength: 10, // Menjaga buffer tetap singkat (10 detik)
        maxMaxBufferLength: 20,
        backBufferLength: 0, // Hapus video segmen lama di belakang timeline
        // Header khusus untuk instruksi Tanpa Cache ke server
        fetchSetup: (context, init) => {
          init.headers = new Headers(init.headers || {});
          init.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
          init.headers.set("Pragma", "no-cache");
          init.headers.set("Expires", "0");
          return new Request(context.url, init);
        },
      });

      hlsRef.current = hls;
      hls.loadSource(noCacheUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Ambil daftar resolusi yang tersedia dari file manifest HLS (.m3u8)
        const levels: QualityLevel[] = hls.levels.map((level, index) => ({
          id: index,
          label: `${level.height}p`,
          height: level.height,
        }));
        setQualities(levels);
        setCurrentQuality(-1); // Setel default ke Auto

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            video.muted = true;
            video.play().catch((err) => console.error("Autoplay Error:", err));
          });
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        if (hls.autoLevelEnabled) {
          setCurrentQuality(-1);
        } else {
          setCurrentQuality(data.level);
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = noCacheUrl;
      video.load();
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl]);

  // Fungsi mengganti resolusi kualitas video
  const changeQuality = (levelIndex: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex; // -1 untuk Auto
    setCurrentQuality(levelIndex);
    setShowQualityMenu(false);
  };

  const goToEpisode = (ep: number) => {
    setCurrentEpisode(ep);
    const newToken = updateWatchSession(currentToken, { episodeNumber: ep });
    setCurrentToken(newToken);
    router.replace(`/watch/flickreels/${playletId}?t=${newToken}`, { scroll: false });
    setShowEpisodeList(false);
  };

  return (
    <main className="fixed inset-0 bg-black flex flex-col select-none overflow-hidden">
      {/* Top Floating Glass Navigation Header */}
      <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-transparent h-28" />
        <div className="relative z-10 flex items-center justify-between h-16 px-4 max-w-7xl mx-auto pointer-events-auto">
          <Link 
            href={`/detail/flickreels/${playletId}`} 
            className="flex items-center gap-2.5 text-white/90 hover:text-white transition-all p-1.5 -ml-2 rounded-2xl hover:bg-white/10 group backdrop-blur-md bg-black/20 border border-white/5"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
              <img src="/flickreels.webp" alt="FlickReels Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-sm hidden sm:inline gradient-text pr-1">
              FlickReels Lite
            </span>
          </Link>

          <div className="text-center flex-1 px-4 min-w-0">
            <h1 className="text-white font-semibold truncate text-xs sm:text-sm tracking-wide drop-shadow-md">
              {title}
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-white/70 text-[11px] font-medium drop-shadow-md">
                Episode {currentEpisode} dari {totalEpisodes}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Pengatur Resolusi */}
            {qualities.length > 0 && (
              <button 
                onClick={() => setShowQualityMenu(!showQualityMenu)} 
                className="p-2.5 text-white/90 hover:text-white transition-all rounded-2xl bg-black/20 hover:bg-white/10 border border-white/5 backdrop-blur-md active:scale-95 flex items-center gap-1 text-xs font-semibold"
                aria-label="Pilih Resolusi"
              >
                <Settings className="w-4 h-4" />
                <span>
                  {currentQuality === -1 
                    ? "Auto" 
                    : qualities.find((q) => q.id === currentQuality)?.label || "HD"}
                </span>
              </button>
            )}

            {/* Tombol Daftar Episode */}
            <button 
              onClick={() => setShowEpisodeList(!showEpisodeList)} 
              className="p-2.5 text-white/90 hover:text-white transition-all rounded-2xl bg-black/20 hover:bg-white/10 border border-white/5 backdrop-blur-md active:scale-95"
              aria-label="Daftar Episode"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up Dialog Pemilih Resolusi / Kualitas */}
      {showQualityMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 w-full max-w-xs space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-white font-bold text-sm">Resolusi Video</h3>
              <button onClick={() => setShowQualityMenu(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => changeQuality(-1)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                  currentQuality === -1 ? "bg-primary text-white font-bold" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <span>Otomatis (Auto)</span>
                {currentQuality === -1 && <span className="text-[10px]">Aktif</span>}
              </button>
              {qualities.map((q) => (
                <button
                  key={q.id}
                  onClick={() => changeQuality(q.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    currentQuality === q.id ? "bg-primary text-white font-bold" : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <span>{q.label}</span>
                  {currentQuality === q.id && <span className="text-[10px]">Aktif</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Video Stage */}
      <div className="flex-1 w-full h-full relative bg-black flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/40 backdrop-blur-xs">
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <Play className="w-5 h-5 text-primary absolute fill-current" />
              </div>
              <p className="text-xs text-white/70 font-medium mt-4 tracking-wider">Memuat Episode {currentEpisode}...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20 bg-zinc-950/90 backdrop-blur-md">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Gagal Memutar Video</h3>
              <p className="text-white/60 text-xs max-w-xs mb-6">Terjadi kesalahan koneksi atau video tidak dapat dimuat saat ini.</p>
              <button 
                onClick={() => refetch()} 
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
            </div>
          )}

          <video 
            ref={videoRef} 
            className="w-full h-full object-contain max-h-[100dvh]" 
            controls 
            playsInline 
            autoPlay 
            crossOrigin="anonymous" 
            {...({ disableRemotePlayback: true, referrerPolicy: "no-referrer" } as any)} 
            onEnded={handleVideoEnded} 
          />
        </div>

        {/* Bottom Floating Glass Episode Controls */}
        <div className="absolute bottom-16 md:bottom-8 left-0 right-0 z-30 pointer-events-none flex justify-center px-4">
          <div className="flex items-center gap-3 md:gap-6 pointer-events-auto bg-black/60 backdrop-blur-xl px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/10 shadow-2xl transition-all origin-bottom">
            <button 
              onClick={() => currentEpisode > 1 && goToEpisode(currentEpisode - 1)} 
              disabled={currentEpisode <= 1} 
              className="p-1.5 md:p-2 rounded-full text-white disabled:opacity-20 hover:bg-white/10 transition-colors active:scale-90"
              title="Episode Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <span className="text-white font-semibold text-xs md:text-sm tabular-nums min-w-[70px] md:min-w-[90px] text-center tracking-wide">
              Ep {currentEpisode} <span className="text-white/40">/ {totalEpisodes}</span>
            </span>

            <button 
              onClick={() => currentEpisode < totalEpisodes && goToEpisode(currentEpisode + 1)} 
              disabled={currentEpisode >= totalEpisodes} 
              className="p-1.5 md:p-2 rounded-full text-white disabled:opacity-20 hover:bg-white/10 transition-colors active:scale-90"
              title="Episode Selanjutnya"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Slide-over Episode List Drawer */}
      {showEpisodeList && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] animate-in fade-in duration-300" 
            onClick={() => setShowEpisodeList(false)} 
          />
          <div className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-zinc-950/95 border-l border-white/10 z-[70] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 backdrop-blur-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-md z-10">
              <div>
                <h2 className="font-bold text-white text-base">Daftar Episode</h2>
                <p className="text-xs text-white/50">{totalEpisodes} Total Episode</p>
              </div>
              <button 
                onClick={() => setShowEpisodeList(false)} 
                className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-2.5 scrollbar-thin">
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((epNum) => {
                const isActive = epNum === currentEpisode;
                return (
                  <button 
                    key={epNum} 
                    onClick={() => goToEpisode(epNum)} 
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl text-xs font-semibold transition-all duration-200 relative ${
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105 ring-2 ring-primary/50" 
                        : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/5"
                    }`}
                  >
                    {isActive ? (
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" />
                        {epNum}
                      </span>
                    ) : (
                      epNum
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default function FlickReelsWatchPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    }>
      <FlickReelsWatchContent />
    </Suspense>
  );
}
