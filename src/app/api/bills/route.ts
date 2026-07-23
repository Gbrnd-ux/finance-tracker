import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, amount, dueDate, recurring, vehiclePlate } = body;

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!name || !type || !amount || !dueDate) {
      return NextResponse.json({ error: "Semua field wajib diisi!" }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Nominal tidak valid!" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dueDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return NextResponse.json({ error: "Tanggal jatuh tempo tidak boleh di masa lalu!" }, { status: 400 });
    }

    const newBill = await prisma.bill.create({
      data: {
        userId,
        name,
        type,
        amount: numericAmount,
        dueDate: new Date(dueDate),
        recurring: recurring || "NONE",
        vehiclePlate: type === "KENDARAAN" ? vehiclePlate : null,
      },
    });

    revalidatePath("/tagihan");
    return NextResponse.json({ success: true, data: newBill });
  } catch (error) {
    console.error("Gagal membuat tagihan:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan tagihan" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bills = await prisma.bill.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" }
    });
    return NextResponse.json({ data: bills });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data tagihan" }, { status: 500 });
  }
}
