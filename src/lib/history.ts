// lib/history.ts

export interface HistoryItem {
  id: string;
  title: string;
  cover: string;
  lastEpisode?: number;
  timestamp?: number;
}

const HISTORY_KEY = "flickreels_history";
const BOOKMARK_KEY = "flickreels_bookmarks";

// --- SIMPAN KE RIWAYAT ---
export const addToHistory = (item: Omit<HistoryItem, "timestamp">) => {
  if (typeof window === "undefined") return;
  try {
    const existing: HistoryItem[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    
    // Hapus data lama yang sama agar tidak duplikat, lalu masukkan ke urutan paling atas
    const filtered = existing.filter((i) => i.id !== item.id);
    const newItem: HistoryItem = { ...item, timestamp: Date.now() };
    const updated = [newItem, ...filtered];

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Gagal menyimpan riwayat:", error);
  }
};

// --- AMBIL DATA RIWAYAT ---
export const getHistory = (): HistoryItem[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
};

// --- TOGGLE BOOKMARK / DISIMPAN ---
export const toggleBookmark = (item: HistoryItem) => {
  if (typeof window === "undefined") return false;
  try {
    const existing: HistoryItem[] = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]");
    const exists = existing.some((i) => i.id === item.id);
    let updated: HistoryItem[];

    if (exists) {
      updated = existing.filter((i) => i.id !== item.id);
    } else {
      updated = [item, ...existing];
    }

    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(updated));
    return !exists; // Mengembalikan status (true jika tersimpan, false jika dihapus)
  } catch (error) {
    console.error("Gagal memperbarui bookmark:", error);
    return false;
  }
};

export const getBookmarks = (): HistoryItem[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]");
  } catch {
    return [];
  }
};
