"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, History, RotateCcw, Play, Film } from "lucide-react";

interface DramaItem {
  id: string;
  title: string;
  cover: string;
  lastEpisode?: number;
}

export default function MyListPage() {
  const [activeTab, setActiveTab] = useState<"bookmark" | "history">("bookmark");
  const [bookmarks, setBookmarks] = useState<DramaItem[]>([]);
  const [history, setHistory] = useState<DramaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Fungsi memuat data dari LocalStorage
  const loadData = () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const savedBookmarks = localStorage.getItem("flickreels_bookmarks");
      const savedHistory = localStorage.getItem("flickreels_history");

      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Gagal memuat daftar:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fungsi Refresh / Coba Lagi
  const handleRetry = () => {
    loadData();
  };

  const currentList = activeTab === "bookmark" ? bookmarks : history;

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground pb-24 pt-6 px-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center my-6 space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Daftar Saya
        </h1>
        <p className="text-xs text-zinc-400 font-medium">
          Koleksi drama yang kamu simpan dan riwayat tontonan.
        </p>
      </div>

      {/* Tab Switcher (Bookmark vs History) */}
      <div className="flex bg-zinc-900/80 p-1 rounded-2xl border border-white/10 mb-6">
        <button
          onClick={() => setActiveTab("bookmark")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === "bookmark"
              ? "bg-primary text-white shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Disimpan ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === "history"
              ? "bg-primary text-white shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          Riwayat ({history.length})
        </button>
      </div>

      {/* Kondisi Jika Terjadi Error + Tombol Coba Lagi */}
      {isError ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <RotateCcw className="w-6 h-6" />
          </div>
          <p className="text-sm text-zinc-300 font-medium">
            Gagal memuat data daftar kamu.
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      ) : isLoading ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-zinc-900 rounded-xl animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        /* Tampilan Kosong */
        <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/30">
          <Film className="w-10 h-10 text-zinc-600" />
          <p className="text-sm text-zinc-400 font-medium">
            {activeTab === "bookmark"
              ? "Belum ada drama yang disimpan."
              : "Belum ada riwayat tontonan."}
          </p>
          <Link
            href="/"
            className="mt-2 text-xs text-primary font-bold hover:underline"
          >
            Jelajahi Drama Sekarang →
          </Link>
        </div>
      ) : (
        /* Grid Daftar Drama */
        <div className="grid grid-cols-3 gap-3">
          {currentList.map((item) => (
            <Link
              key={item.id}
              href={`/watch/${item.id}`}
              className="group relative flex flex-col overflow-hidden rounded-xl bg-zinc-900 border border-white/5 hover:border-primary/50 transition-all duration-300"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={item.cover || "/placeholder.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 33vw, 200px"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
              <div className="p-2">
                <h3 className="text-xs font-semibold text-zinc-200 truncate">
                  {item.title}
                </h3>
                {item.lastEpisode && (
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Eps {item.lastEpisode}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
