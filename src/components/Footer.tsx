"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Heart, Film, ShieldCheck, Zap } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on watch pages for immersive video experience
  if (pathname?.startsWith("/watch")) {
    return null;
  }

  return (
    <footer className="relative border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl text-foreground overflow-hidden">
      {/* Decorative Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-10 relative z-10">
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto">
          
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-primary to-purple-600 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/25">
              <img
                src="/flickreels.webp"
                alt="FlickReels Lite Logo"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight gradient-text">
              FlickReels Lite
            </span>
          </Link>

          {/* Slogan / Short Description */}
          <p className="text-sm text-muted-foreground/90 max-w-md leading-relaxed">
            Platform streaming drama pendek terbaik. Nikmati ribuan serial menarik secara gratis dengan kualitas HD tanpa hambatan.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 py-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-300 backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Fast Streaming
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-300 backdrop-blur-md">
              <Film className="w-3.5 h-3.5 text-primary" /> HD Resolution
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-300 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Free Access
            </span>
          </div>

          <div className="w-full max-w-xs h-px bg-white/10 my-2" />

          {/* Copyright & Maker Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
            <p>© {new Date().getFullYear()} FlickReels Lite. All rights reserved.</p>
            <span className="hidden sm:inline text-white/20">•</span>
            <p className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-current animate-pulse" /> by <span className="text-foreground font-semibold">Yusril</span>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
