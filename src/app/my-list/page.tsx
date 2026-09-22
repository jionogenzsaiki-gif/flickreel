"use client";

import { useState, useEffect } from "react";
import { getBookmarks, getHistory, HistoryItem } from "@/lib/history";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, History, Trash2 } from "lucide-react";

export default function MyListPage() {
  const [activeTab, setActiveTab] = useState<"bookmarks" | "history">("bookmarks");
  const [bookmarks, setBookmarks] = useState<HistoryItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data dari localStorage saat komponen dibuka
  useEffect(() => {
    const bookmarkData = getBookmarks();
    const historyData = getHistory();
    
    setBookmarks(bookmarkData);
    setHistory(historyData);
    setIsLoading(false);
  }, []);

  // Hapus item dari daftar bookmark
  const handleRemoveBookmark = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const existing: HistoryItem[] = JSON.parse(localStorage.getItem("flickreels_bookmarks") || "[]");
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem("flickreels_bookmarks", JSON.stringify(updated));
    setBookmarks(updated);
  };

  // Hapus item dari riwayat
  const handleRemoveHistory = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const existing: HistoryItem[] = JSON.parse(localStorage.getItem("flickreels_history") || "[]");
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem("flickreels_history", JSON.stringify(updated));
    setHistory(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const currentList = activeTab === "bookmarks" ? bookmarks : history;

  return (
    <div className="min-h-screen bg-black text-white container mx-auto px-4 py-8 pb-28 max-w-md md:max-w-4xl">
      {/* Header Page */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
          {activeTab === "bookmarks" ? <Bookmark className="w-6 h-6" /> : <History className="w-6 h-6" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Daftar Saya & Riwayat</h1>
          <p className="text-sm text-zinc-400">Kelola drama yang kamu simpan dan riwayat tontonanmu</p>
        </div>
      </div>

      {/* Tab Switcher (Daftar Saya vs Riwayat) */}
      <div className="flex bg-zinc-900 p-1.5 rounded-2xl mb-6 border border-zinc-800">
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "bookmarks"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Daftar Saya ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "history"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          Riwayat ({history.length})
        </button>
      </div>

      {/* Tampilan Jika Daftar Kosong */}
      {currentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/40">
          {activeTab === "bookmarks" ? (
            <Bookmark className="w-12 h-12 text-zinc-600 mb-3" />
          ) : (
            <History className="w-12 h-12 text-zinc-600 mb-3" />
          )}
          <h3 className="font-semibold text-white text-lg">
            {activeTab === "bookmarks" ? "Belum ada drama tersimpan" : "Belum ada riwayat tontonan"}
          </h3>
          <p className="text-sm text-zinc-400 max-w-sm mt-1">
            {activeTab === "bookmarks"
              ? "Jelajahi platform SekaiDrama dan simpan drama favoritmu agar muncul di sini."
              : "Drama yang baru saja kamu tonton akan tersimpan otomatis di halaman ini."}
          </p>
        </div>
      ) : (
        /* Grid Daftar Drama */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {currentList.map((drama) => (
            <Link
              key={drama.id}
              href={`/detail/flickreels/${drama.id}`}
              className="group relative flex flex-col bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
                {drama.cover ? (
                  <Image
                    src={drama.cover}
                    alt={drama.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-zinc-500">No Cover</div>
                )}

                {/* Tombol Hapus */}
                <button
                  onClick={(e) =>
                    activeTab === "bookmarks"
                      ? handleRemoveBookmark(e, drama.id)
                      : handleRemoveHistory(e, drama.id)
                  }
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 hover:text-red-400 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 flex flex-col flex-grow justify-between">
                <h3 className="font-semibold text-sm text-white line-clamp-2 group-hover:text-primary transition-colors">
                  {drama.title}
                </h3>
                {drama.lastEpisode && (
                  <span className="text-[11px] text-zinc-400 mt-2">
                    Terakhir: Episode {drama.lastEpisode}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
