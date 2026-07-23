"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function getSetting(key: string, defaultValue: string = "true") {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return defaultValue;

  const setting = await prisma.setting.findUnique({
    where: { userId_key: { userId, key } },
  });
  return setting ? setting.value : defaultValue;
}

export async function toggleSetting(key: string, currentValue: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const newValue = currentValue === "true" ? "false" : "true";
    
    await prisma.setting.upsert({
      where: { userId_key: { userId, key } },
      update: { value: newValue },
      create: { userId, key, value: newValue },
    });
    
    revalidatePath("/pengaturan");
    return { success: true, value: newValue };
  } catch (error) {
    console.error("Gagal mengubah pengaturan:", error);
    return { success: false, error: "Gagal menyimpan pengaturan" };
  }
}
