import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateScaledAllocations } from "@/lib/allocation";
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

    await prisma.$transaction(async (tx) => {
      // Cek kepemilikan
      const income = await tx.income.findUnique({ where: { id } });
      if (!income || income.userId !== userId) {
        throw new Error("Unauthorized or not found");
      }

      // Hapus alokasi yang terkait dengan income ini terlebih dahulu (karena FK constraint)
      await tx.allocation.deleteMany({
        where: { incomeId: id },
      });

      // Hapus income
      await tx.income.delete({
        where: { id },
      });
    });

    revalidatePath("/pemasukan");
    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus data:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus data" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { amount, date, source, description } = body;

    if (!amount || !date || !source) {
      return NextResponse.json(
        { error: "Semua field yang wajib harus diisi!" },
        { status: 400 }
      );
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Jumlah tidak valid!" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Ambil data pemasukan lama beserta alokasinya
      const oldIncome = await tx.income.findUnique({
        where: { id },
        include: { allocations: true },
      });

      if (!oldIncome || oldIncome.userId !== userId) throw new Error("Data tidak ditemukan atau unauthorized");

      // 1. Update data pemasukan
      const updatedIncome = await tx.income.update({
        where: { id },
        data: {
          amount: numericAmount,
          date: new Date(date),
          source,
          description: description || null,
        },
      });

      // 2. Jika nominal berubah, sesuaikan alokasi lama secara proporsional
      // Ini menjaga agar persentase riwayat (historical) tidak tertimpa persentase masa kini
      const scaledAllocations = calculateScaledAllocations(numericAmount, oldIncome.amount, oldIncome.allocations);
      
      for (const alloc of scaledAllocations) {
        await tx.allocation.update({
          where: { id: alloc.id },
          data: { amount: alloc.amount },
        });
      }
    });

    revalidatePath("/pemasukan");
    return NextResponse.json({ success: true, message: "Data berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal memperbarui data:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui data" },
      { status: 500 }
    );
  }
}
