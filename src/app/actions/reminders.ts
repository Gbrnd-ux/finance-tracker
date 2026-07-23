"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function dismissReminder(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const reminder = await prisma.reminder.findUnique({ 
      where: { id },
      include: { bill: true }
    });

    if (!reminder || reminder.bill.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await prisma.reminder.update({
      where: { id },
      data: { isSent: true }, // Tandai sebagai sudah dibaca/diselesaikan
    });
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Gagal menyembunyikan reminder:", error);
    return { success: false, error: "Gagal memperbarui status" };
  }
}
