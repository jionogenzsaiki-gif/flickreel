"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useFlickReelsSearch } from "@/hooks/useFlickReels";
import { usePlatform } from "@/hooks/usePlatform";
import { useDebounce } from "@/hooks/useDebounce";
import { usePathname } from "next/navigation";
import { optimizeThumb } from "@/lib/image-utils";

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Naikkan delay debounce dari 300ms ke 600ms agar sangat menghemat request CPU
  const debouncedQuery = useDebounce(searchQuery, 600);
  const normalizedQuery = debouncedQuery.trim();

  const { isFlickReels } = usePlatform();

  // Search FlickReels
  const { data: flickReelsResults, isLoading: isSearchingFlickReels } = useFlickReelsSearch(
    normalizedQuery
  );

  const isSearching = isSearchingFlickReels;
  const searchResults = flickReelsResults?.data || [];

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  // Sembunyikan header jika berada di halaman pemutar video
  if (pathname?.startsWith("/watch")) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img
                src="/flickreels.webp"
                alt="FlickReels Lite Logo"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <span className="font-display font-bold text-xl text-white">
              FlickReels Lite
            </span>
          </Link>

          {/* Search Button Only */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay (Portal) */}
      {searchOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-background z-[9999] overflow-hidden">
            <div className="container mx-auto px-4 py-6 h-[100dvh] flex flex-col">
              <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari drama FlickReels..."
                    className="search-input pl-12"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSearchClose}
                  className="p-3 rounded-xl hover:bg-muted/50 transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Results */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                {isSearching && normalizedQuery && (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* FlickReels Results */}
                {!isSearching && searchResults && searchResults.length > 0 && (
                  <div className="grid gap-3">
                    {searchResults.map((drama: any, index: number) => (
                      <Link
                        key={`${drama.playletId}-${index}`}
                        href={`/detail/flickreels/${drama.playletId}`}
                        onClick={handleSearchClose}
                        className="flex gap-4 p-4 rounded-2xl bg-card hover:bg-muted transition-all text-left animate-fade-up overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <img
                          src={optimizeThumb(drama.cover)}
                          alt={drama.title}
                          className="w-16 h-24 object-cover rounded-xl flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-foreground truncate">{drama.title}</h3>
                          {drama.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {drama.description}
                            </p>
                          )}
                          {drama.tags && drama.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {drama.tags.slice(0, 3).map((tag: string, idx: number) => (
                                <span key={idx} className="tag-pill text-[10px]">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {!isSearching && searchResults.length === 0 && normalizedQuery && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Tidak ada hasil untuk "{normalizedQuery}"</p>
                  </div>
                )}

                {!normalizedQuery && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Ketik untuk mencari drama</p>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
