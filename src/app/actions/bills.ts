"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateNextRecurringDate } from "@/lib/dates";
import { auth } from "@/lib/auth";

export async function markBillAsPaid(id: string, currentStatus: boolean) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const isMarkingAsPaid = !currentStatus;

    await prisma.$transaction(async (tx) => {
      // 1. Verifikasi kepemilikan
      const bill = await tx.bill.findUnique({ where: { id } });
      if (!bill || bill.userId !== userId) throw new Error("Unauthorized");

      // 2. Update tagihan yang sekarang
      const updatedBill = await tx.bill.update({
        where: { id },
        data: { isPaid: isMarkingAsPaid },
      });

      // 2. Jika ditandai LUNAS dan tagihan ini berulang, buat tagihan untuk periode selanjutnya
      if (isMarkingAsPaid && updatedBill.recurring !== "NONE") {
        const nextDueDate = calculateNextRecurringDate(updatedBill.dueDate, updatedBill.recurring);

        // Cek apakah tagihan untuk periode depan sudah ada (untuk menghindari duplikasi jika user spam klik)
        const existingNextBill = await tx.bill.findFirst({
          where: {
            name: updatedBill.name,
            type: updatedBill.type,
            amount: updatedBill.amount,
            dueDate: nextDueDate,
          },
        });

        // Jika belum ada, buat tagihan baru
        if (!existingNextBill) {
          await tx.bill.create({
            data: {
              userId,
              name: updatedBill.name,
              type: updatedBill.type,
              vehiclePlate: updatedBill.vehiclePlate,
              amount: updatedBill.amount,
              dueDate: nextDueDate,
              recurring: updatedBill.recurring,
              isPaid: false, // Tagihan baru tentu belum lunas
            },
          });
        }
      }
    });
    
    revalidatePath("/tagihan");
    return { success: true };
  } catch (error) {
    console.error("Gagal update status tagihan:", error);
    return { success: false, error: "Gagal memperbarui status" };
  }
}

export async function deleteBill(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const bill = await prisma.bill.findUnique({ where: { id } });
    if (!bill || bill.userId !== userId) throw new Error("Unauthorized");

    await prisma.bill.delete({
      where: { id },
    });
    
    revalidatePath("/tagihan");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus tagihan:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
}
