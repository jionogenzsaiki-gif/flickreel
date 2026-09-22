"use client";

import { useEffect, useState } from "react";
import { getHistory, getBookmarks, HistoryItem } from "@/lib/history";
import { User, Bookmark, History, Info, ShieldCheck, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const [historyCount, setHistoryCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    // Mengambil jumlah data riwayat dan bookmark dari LocalStorage
    const historyData: HistoryItem[] = getHistory();
    const bookmarkData: HistoryItem[] = getBookmarks();
    
    setHistoryCount(historyData.length);
    setBookmarkCount(bookmarkData.length);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white pb-28 pt-6 px-4 max-w-md md:max-w-2xl mx-auto">
      {/* Header Profile Card */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-6 shadow-xl mb-6 overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Pengguna SekaiDrama</h1>
            <p className="text-xs text-zinc-400 font-medium">SekaiDrama Lite v1.0.0.2026.v1-lite</p>
          </div>
        </div>

        {/* Statistik Singkat */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/10 relative z-10">
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <span className="block text-lg font-black text-primary">{historyCount}</span>
            <span className="text-[11px] text-zinc-400 font-medium">Riwayat Ditonton</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <span className="block text-lg font-black text-primary">{bookmarkCount}</span>
            <span className="text-[11px] text-zinc-400 font-medium">Drama Disimpan</span>
          </div>
        </div>
      </div>

      {/* Menu Navigasi & Pengaturan */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2">Menu Saya</h2>
        
        <Link
          href="/my-list"
          className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/80 border border-white/5 hover:bg-zinc-800/80 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-white">Daftar Saya & Riwayat</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/for-you"
          className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/80 border border-white/5 hover:bg-zinc-800/80 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-white">Rekomendasi Untuk Kamu</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 pt-4">Informasi</h2>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/80 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-white">Versi Aplikasi</span>
          </div>
          <span className="text-xs text-zinc-400 font-bold bg-white/5 px-2.5 py-1 rounded-lg">v1.0.0.2026.v1-lite</span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/80 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-white">Tentang FlickReels Lite</span>
          </div>
          <span className="text-xs text-zinc-400 font-medium">Platform Streaming</span>
        </div>
      </div>
    </main>
  );
}
