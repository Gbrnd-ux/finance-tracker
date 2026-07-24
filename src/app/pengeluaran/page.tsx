import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";

export default async function PengeluaranPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Ambil semua kategori user untuk dropdown
  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: { name: 'asc' },
  });

  // Ambil data pengeluaran (urutkan terbaru di atas)
  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    include: {
      category: true, // Relasi untuk mendapatkan nama kategori dan warnanya
    }
  });

  const totalPengeluaran = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pengeluaran</h1>
          <p className="text-gray-500 mt-2 text-sm">Catat setiap pengeluaran agar sisa budget tetap terkontrol.</p>
        </div>
        
        <div className="bg-rose-50 border border-rose-100 px-6 py-4 rounded-2xl md:min-w-[200px] text-right">
          <p className="text-sm font-medium text-rose-600 mb-1">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-rose-700">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
        </div>
      </header>

      <ExpenseForm categories={categories} />
      
      <ExpenseList expenses={expenses} />
    </div>
  );
}
