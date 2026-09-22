"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegister ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (!isRegister && data.token) {
          localStorage.setItem("authToken", data.token);
          router.push("/profile");
        } else {
          alert("Registrasi berhasil! Silakan login.");
          setIsRegister(false);
        }
      } else {
        alert(data.message || "Gagal memproses permintaan");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold mb-6 text-center">
          {isRegister ? "Daftar Akun Baru" : "Masuk ke FlickReels"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs text-zinc-400">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full mt-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm transition-all"
          >
            {loading ? "Memproses..." : isRegister ? "Daftar" : "Masuk"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-400">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-primary font-semibold underline ml-1"
          >
            {isRegister ? "Masuk" : "Daftar"}
          </button>
        </p>
      </div>
    </div>
  );
}
