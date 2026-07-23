import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Cek apakah kategori ada
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { allocations: true } } }
    });

    if (!category || category.userId !== userId) {
      return NextResponse.json({ error: "Kategori tidak ditemukan atau unauthorized" }, { status: 404 });
    }

    // Gunakan transaction untuk memastikan integritas
    await prisma.$transaction(async (tx) => {
      // 1. Hapus semua alokasi yang terkait dengan kategori ini
      await tx.allocation.deleteMany({
        where: { categoryId: id },
      });

      // 2. Hapus kategori
      await tx.category.delete({
        where: { id },
      });
    });

    revalidatePath("/budget");
    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus!" });
  } catch (error) {
    console.error("Gagal menghapus kategori:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus data" },
      { status: 500 }
    );
  }
}
