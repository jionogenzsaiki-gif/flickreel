"use client";

import { useState, useEffect } from "react";
import { toggleBookmark, getBookmarks, HistoryItem } from "@/lib/history";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  item: HistoryItem;
}

export function BookmarkButton({ item }: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Cek status tersimpan saat komponen dimuat di browser
    const bookmarks = getBookmarks();
    const exists = bookmarks.some((b) => b.id === item.id);
    setIsSaved(exists);
  }, [item.id]);

  const handleToggle = () => {
    const status = toggleBookmark(item);
    setIsSaved(status);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
        isSaved
          ? "bg-primary text-white shadow-lg shadow-primary/20"
          : "bg-muted/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground"
      }`}
    >
      <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
      <span>{isSaved ? "Tersimpan" : "Simpan"}</span>
    </button>
  );
}
