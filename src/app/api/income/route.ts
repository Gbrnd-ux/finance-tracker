import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateNewAllocations } from "@/lib/allocation";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, date, source, description } = body;

    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Jalankan dalam transaction agar aman
    await prisma.$transaction(async (tx) => {
      // 1. Ambil semua kategori milik user untuk alokasi otomatis
      const categories = await tx.category.findMany({ where: { userId } });

      // 2. Buat Pemasukan
      const income = await tx.income.create({
        data: {
          userId,
          amount: numericAmount,
          date: new Date(date),
          source,
          description: description || null,
        },
      });

      // 3. Hitung dan buat Alokasi secara otomatis
      const allocationsData = calculateNewAllocations(numericAmount, categories);
      
      if (allocationsData.length > 0) {
        await tx.allocation.createMany({
          data: allocationsData.map(alloc => ({
            incomeId: income.id,
            ...alloc
          })),
        });
      }
    });

    revalidatePath("/pemasukan");
    return NextResponse.json({ success: true, message: "Pemasukan berhasil dicatat dan dialokasikan!" });
  } catch (error) {
    console.error("Gagal menambahkan pemasukan:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan data." },
      { status: 500 }
    );
  }
}
