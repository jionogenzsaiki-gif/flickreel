import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Contoh validasi dummy
    if (email === "user@flickreels.com" && password === "123456") {
      const token = "dummy-jwt-token-12345";

      return NextResponse.json({
        message: "Login berhasil",
        token,
        user: { name: "User FlickReels", email },
      });
    }

    return NextResponse.json(
      { message: "Email atau password salah" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
