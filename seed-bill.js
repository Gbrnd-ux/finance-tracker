const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);

  await prisma.bill.create({
    data: {
      name: "Cicilan Laptop",
      type: "LAINNYA",
      amount: 1500000,
      dueDate: targetDate,
      isPaid: false
    }
  });

  console.log("Seeded bill for H-3");
}
main();
