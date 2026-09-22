"use client";

import { useEffect, useState } from "react";
import { getForYouRecommendations, ForYouItem } from "@/lib/recommendation";
import { Sparkles, Play, Loader2, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ForYouPage() {
  const [items, setItems] = useState<ForYouItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getForYouRecommendations();
      setItems(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24 pt-6 px-4 max-w-md mx-auto">
      {/* Header Title */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-primary/20 text-primary">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">Untuk Kamu</h1>
          <p className="text-xs text-zinc-400">Rekomendasi drama pilihan hari ini</p>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-6">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="relative bg-zinc-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Cover Banner with Overlay */}
            <div className="relative aspect-[3/4] w-full bg-zinc-950">
              <Image
                src={item.cover}
                alt={item.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              {/* Category Badge */}
              {item.category && (
                <span className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {item.category}
                </span>
              )}

              {/* Action Buttons on Right Side */}
              <div className="absolute bottom-6 right-4 flex flex-col gap-4 z-10">
                <button 
                  onClick={() => alert("Ditambahkan ke Favorit!")}
                  className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => alert("Link disalin!")}
                  className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom Info & Play Button */}
              <div className="absolute bottom-4 left-4 right-16 z-10">
                <h2 className="text-lg font-bold text-white mb-2 leading-snug drop-shadow-md">
                  {item.title}
                </h2>
                <Link
                  href={`/watch/flickreels/${item.id}?t=session_init`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs shadow-lg transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Mulai Nonton
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
