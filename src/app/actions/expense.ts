"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function addExpense(formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const amount = Number(formData.get("amount"));
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const categoryId = formData.get("categoryId") as string;

    if (!amount || !description || !date || !categoryId) {
      return { success: false, error: "Semua field wajib diisi!" };
    }

    if (amount <= 0) {
      return { success: false, error: "Jumlah harus lebih dari 0!" };
    }

    // Verifikasi kategori
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== userId) {
      return { success: false, error: "Kategori tidak valid!" };
    }

    await prisma.expense.create({
      data: {
        userId,
        amount,
        description,
        date: new Date(date),
        categoryId,
      },
    });

    revalidatePath("/pengeluaran");
    revalidatePath("/budget");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Gagal menambahkan pengeluaran:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function deleteExpense(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== userId) throw new Error("Unauthorized");

    await prisma.expense.delete({
      where: { id },
    });
    
    revalidatePath("/pengeluaran");
    revalidatePath("/budget");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus pengeluaran:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
}
