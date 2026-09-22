import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // TODO: Simpan user ke Database (Prisma / Supabase / MongoDB)
    // Contoh dummy response berhasil:
    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: { name, email },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
