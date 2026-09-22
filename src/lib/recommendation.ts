// lib/recommendation.ts
import { getHistory } from "./history";

export interface ForYouItem {
  id: string;
  title: string;
  cover: string;
  category?: string;
}

// Fungsi untuk mendapatkan data rekomendasi (bisa disesuaikan dengan data API/mock kamu)
export const getForYouRecommendations = async (): Promise<ForYouItem[]> => {
  if (typeof window === "undefined") return [];

  // Ambil riwayat pengguna terakhir untuk personalisasi
  const history = getHistory();
  const lastWatched = history.length > 0 ? history[0] : null;

  // Contoh data rekomendasi drama (kamu bisa menggantinya dengan fetch dari API FlickReels)
  const mockRecommendations: ForYouItem[] = [
    {
      id: "trending-1",
      title: "CEO Dingin Mencintaiku",
      cover: "/flickreels.webp",
      category: "Trending",
    },
    {
      id: "trending-2",
      title: "Pernikahan Rahasia Sang Miliarder",
      cover: "/flickreels.webp",
      category: "Drama Pilihan",
    },
    {
      id: "trending-3",
      title: "Kembalinya Pewaris Takhta",
      cover: "/flickreels.webp",
      category: "Wajib Tonton",
    },
  ];

  return mockRecommendations;
};
