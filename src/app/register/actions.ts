"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const name     = (formData.get("name") as string)?.trim();
  const email    = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirm  = formData.get("confirm") as string;

  // Validasi dasar
  if (!name || !email || !password || !confirm) {
    return { success: false, error: "Semua kolom wajib diisi." };
  }
  if (password.length < 8) {
    return { success: false, error: "Password minimal 8 karakter." };
  }
  if (password !== confirm) {
    return { success: false, error: "Konfirmasi password tidak cocok." };
  }

  // Cek email sudah terdaftar
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Email ini sudah terdaftar. Silakan login." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { 
      name, 
      email, 
      password: hashedPassword,
      categories: {
        create: [
          { name: "Kebutuhan Pokok", color: "#3B82F6", defaultPercentage: 50 },
          { name: "Tabungan", color: "#10B981", defaultPercentage: 20 },
          { name: "Hiburan", color: "#8B5CF6", defaultPercentage: 20 },
          { name: "Lainnya", color: "#F59E0B", defaultPercentage: 10 },
        ],
      },
      settings: {
        create: [
          { key: "NOTIFICATIONS_ENABLED", value: "false" },
        ],
      },
    },
  });

  return { success: true };
}
