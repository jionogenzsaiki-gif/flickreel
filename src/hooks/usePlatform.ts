"use client";

import { create } from "zustand";

export type Platform = "flickreels";

export interface PlatformInfo {
  id: Platform;
  name: string;
  logo: string;
  apiBase: string;
}

export const PLATFORMS: PlatformInfo[] = [
  {
    id: "flickreels",
    name: "FlickReels",
    logo: "/flickreels.webp",
    apiBase: "/api/flickreels",
  },
];

interface PlatformState {
  currentPlatform: Platform;
  setPlatform: (platform: Platform) => void;
}

export const usePlatformStore = create<PlatformState>((set) => ({
  currentPlatform: "flickreels",
  setPlatform: (platform) => set({ currentPlatform: platform }),
}));

export function usePlatform() {
  const { currentPlatform, setPlatform } = usePlatformStore();
  const platformInfo = PLATFORMS.find((p) => p.id === currentPlatform)!;

  const getPlatformInfo = (platformId: Platform) => {
    return PLATFORMS.find((p) => p.id === platformId) || PLATFORMS[0];
  };

  return {
    currentPlatform,
    platformInfo,
    setPlatform,
    platforms: PLATFORMS,
    getPlatformInfo,
    isPineDrama: false,
    isDramaBox: false,
    isReelShort: false,
    isShortMax: false,
    isNetShort: false,
    isMelolo: false,
    isFreeReels: false,
    isDramaNova: false,
    isGoodShort: false,
    isFlickReels: true,
  };
}
