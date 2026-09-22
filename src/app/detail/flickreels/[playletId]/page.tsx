"use client";

import { UnifiedErrorDisplay } from "@/components/UnifiedErrorDisplay";
import { useFlickReelsDetail } from "@/hooks/useFlickReels";
import { Play, ChevronLeft, Film, ListVideo } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useParams } from "next/navigation";
import { optimizeBg, optimizePoster } from "@/lib/image-utils";
import { createWatchToken } from "@/lib/watch-session";

export default function FlickReelsDetailPage() {
  const params = useParams();
  const playletId = (params?.playletId || params?.bookId) as string;
  const router = useRouter();

  const { data, isLoading, error, refetch } = useFlickReelsDetail(playletId || "");

  if (isLoading) return <DetailSkeleton />;

  if (error || !data) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <UnifiedErrorDisplay 
          title="Drama tidak ditemukan"
          message="Tidak dapat memuat detail drama dari FlickReels Lite. Silakan coba lagi atau kembali ke beranda."
          onRetry={() => refetch()}
          retryLabel="Coba Lagi"
        />
      </div>
    );
  }

  const handleWatch = (episodeNumber = 1) => {
    const token = createWatchToken({ platform: 'flickreels', bookId: playletId, episodeNumber });
    router.push(`/watch/flickreels/${playletId}?t=${token}`);
  };

  const episodes = Array.isArray(data.episodes) ? data.episodes : [];
  const totalEpisodes = data.totalEpisodes || episodes.length || 0;

  return (
    <main className="min-h-screen pt-20 pb-12">
      <div className="relative">
        {/* Dynamic Background Blur */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={optimizeBg(data.cover)} 
            alt="" 
            className="w-full h-full object-cover opacity-20 blur-3xl scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-8">
          {/* Tombol Kembali */}
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
            {/* Poster / Cover */}
            <div className="relative group mx-auto md:mx-0 w-full max-w-[300px]">
              <img 
                src={optimizePoster(data.cover)} 
                alt={data.title} 
                className="w-full rounded-2xl shadow-2xl border border-white/10" 
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
                <button 
                  onClick={() => handleWatch(1)} 
                  className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Tonton Sekarang
                </button>
              </div>
            </div>

            {/* Informasi Drama */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold font-display gradient-text mb-4">
                  {data.title}
                </h1>

                {/* Badge Episode Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/50 border border-border/50">
                    <Film className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">{totalEpisodes} Episode</span>
                  </div>
                </div>

                {/* Label / Genre */}
                {data.labels && data.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {data.labels.map((label: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sinopsis */}
              <div className="glass rounded-2xl p-5 border border-border/50 backdrop-blur-md">
                <h3 className="font-semibold text-foreground mb-2 text-base">Sinopsis</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {data.description || "Tidak ada deskripsi untuk drama ini."}
                </p>
              </div>

              {/* Tombol Utama */}
              <button 
                onClick={() => handleWatch(1)} 
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white transition-all hover:scale-105 shadow-xl shadow-primary/25 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Play className="w-5 h-5 fill-current" />
                Mulai Menonton
              </button>
            </div>
          </div>

          {/* Grid Daftar Episode */}
          {episodes.length > 0 && (
            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <ListVideo className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold font-display">Daftar Episode</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {episodes.map((ep: any) => {
                  const epNum = ep.num || ep.episodeNumber || 1;
                  return (
                    <button
                      key={ep.id || epNum}
                      onClick={() => handleWatch(epNum)}
                      className="p-3 rounded-xl bg-card hover:bg-primary/20 border border-border hover:border-primary/50 transition-all text-center group"
                    >
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary">
                        {ep.name || `Eps ${epNum}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen pt-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <Skeleton className="aspect-[2/3] w-full max-w-[300px] rounded-2xl mx-auto md:mx-0" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 rounded-xl" />
            <Skeleton className="h-6 w-1/3 rounded-lg" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-12 w-48 rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
