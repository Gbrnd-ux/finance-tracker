import BillForm from "./BillForm";
import BillList from "./BillList";
import BillTrendChart from "./BillTrendChart";
import { prisma } from "@/lib/prisma";

import { auth } from "@/lib/auth";

export default async function TagihanPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const bills = await prisma.bill.findMany({
    where: { userId },
    orderBy: { dueDate: "asc" }
  });

  // Ambil data tagihan 6 bulan terakhir untuk grafik tren
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // Susun template 6 bulan terakhir
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const trendMap: Record<string, number> = {};
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    trendMap[monthKey] = 0;
  }

  // Masukkan nominal dari semua tagihan ke bulan yang sesuai berdasarkan dueDate
  bills.forEach(bill => {
    if (bill.dueDate >= sixMonthsAgo) {
      const monthKey = `${monthNames[bill.dueDate.getMonth()]} ${bill.dueDate.getFullYear()}`;
      if (trendMap[monthKey] !== undefined) {
        trendMap[monthKey] += bill.amount;
      }
    }
  });

  const trendData = Object.keys(trendMap).map(key => ({
    month: key.split(" ")[0],
    amount: trendMap[key]
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tagihan & Pengingat</h1>
        <p className="text-gray-500 mt-2 text-sm">Kelola pengeluaran wajib bulanan Anda agar tidak terlewat.</p>
      </div>

      <BillTrendChart data={trendData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <BillForm />
        </div>
        
        <div className="lg:col-span-2">
          <BillList bills={bills} />
        </div>
      </div>
    </div>
  );
}
