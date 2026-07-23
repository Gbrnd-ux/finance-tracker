import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL dan ADMIN_PASSWORD harus ada di .env");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✅ User ${email} sudah ada, tidak perlu dibuat ulang.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: "Admin",
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

  console.log(`✅ Akun berhasil dibuat!`);
  console.log(`   Email   : ${user.email}`);
  console.log(`   Password: ${password}`);
  console.log(`\nSilakan login di http://localhost:3000/login`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
