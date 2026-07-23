import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const categories: { id: string; defaultPercentage: number }[] = await request.json();

    // Validasi input
    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
    }

    // Validasi total persentase
    const totalPercentage = categories.reduce((sum, cat) => sum + cat.defaultPercentage, 0);
    if (totalPercentage !== 100) {
      return NextResponse.json(
        { error: `Total persentase harus 100%. Saat ini: ${totalPercentage}%` },
        { status: 400 }
      );
    }

    // Cek kepemilikan kategori sebelum update
    const dbCategories = await prisma.category.findMany({
      where: { id: { in: categories.map(c => c.id) }, userId }
    });
    if (dbCategories.length !== categories.length) {
      return NextResponse.json({ error: "Unauthorized or category not found" }, { status: 401 });
    }

    // Update semua kategori dalam satu transaksi
    await prisma.$transaction(
      categories.map((cat) =>
        prisma.category.update({
          where: { id: cat.id },
          data: { defaultPercentage: cat.defaultPercentage },
        })
      )
    );

    revalidatePath("/budget");
    return NextResponse.json({ success: true, message: "Persentase budget berhasil diperbarui!" });
  } catch (error) {
    console.error("Gagal memperbarui kategori:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, color } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Nama kategori tidak boleh kosong" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        userId,
        name,
        color: color || "#3B82F6", // Default blue if no color provided
        defaultPercentage: 0, // Kategori baru selalu 0%, user harus adjust manual agar total 100%
      },
    });

    revalidatePath("/budget");
    return NextResponse.json({ success: true, data: newCategory });
  } catch (error) {
    console.error("Gagal membuat kategori:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat kategori baru" },
      { status: 500 }
    );
  }
}
