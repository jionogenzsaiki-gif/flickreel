"use client";

import { useState, useEffect } from "react";
import { getBookmarks, HistoryItem } from "@/lib/history";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Trash2 } from "lucide-react";

export default function MyListPage() {
  const [bookmarks, setBookmarks] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data dari localStorage saat pertama kali komponen dibuka di klien
  useEffect(() => {
    const data = getBookmarks();
    setBookmarks(data);
    setIsLoading(false);
  }, []);

  // Fungsi untuk menghapus item langsung dari halaman daftar
  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Mencegah link terbuka saat tombol hapus diklik
    const existing: HistoryItem[] = JSON.parse(localStorage.getItem("flickreels_bookmarks") || "[]");
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem("flickreels_bookmarks", JSON.stringify(updated));
    setBookmarks(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
          <Bookmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Daftar Saya</h1>
          <p className="text-sm text-muted-foreground">Drama yang telah kamu simpan untuk ditonton nanti</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 rounded-3xl border border-dashed border-border/60 bg-muted/20">
          <Bookmark className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-foreground text-lg">Belum ada drama tersimpan</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Jelajahi dan ketuk tombol simpan pada drama favoritmu agar muncul di halaman ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {bookmarks.map((drama) => (
            <Link
              key={drama.id}
              href={`/watch/${drama.id}`}
              className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                {drama.cover ? (
                  <Image
                    src={drama.cover}
                    alt={drama.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No Cover</div>
                )}
                
                {/* Tombol Hapus Cepat */}
                <button
                  onClick={(e) => handleRemove(e, drama.id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-red-400 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                  title="Hapus dari daftar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 flex flex-col flex-grow justify-between">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {drama.title}
                </h3>
                {drama.lastEpisode && (
                  <span className="text-[11px] text-muted-foreground mt-2">
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
