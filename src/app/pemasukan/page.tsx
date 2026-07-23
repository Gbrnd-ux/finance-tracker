import { prisma } from "@/lib/prisma";
import IncomeForm from "./IncomeForm";
import IncomeList from "./IncomeList";
import IncomeTrendChart from "./IncomeTrendChart";

import { auth } from "@/lib/auth";

export default async function PemasukanPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  // Ambil data pemasukan 6 bulan terakhir untuk grafik tren
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const recentIncomes = await prisma.income.findMany({
    where: { userId, date: { gte: sixMonthsAgo } },
    orderBy: { date: 'asc' }
  });

  // Susun template 6 bulan terakhir agar bulan yang kosong tetap muncul di grafik (bernilai 0)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const trendMap: Record<string, number> = {};
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    trendMap[monthKey] = 0;
  }

  // Isi data pemasukan ke dalam map
  recentIncomes.forEach(inc => {
    const monthKey = `${monthNames[inc.date.getMonth()]} ${inc.date.getFullYear()}`;
    if (trendMap[monthKey] !== undefined) {
      trendMap[monthKey] += inc.amount;
    }
  });

  // Ubah map menjadi array untuk Recharts
  const trendData = Object.keys(trendMap).map(key => ({
    month: key.split(" ")[0], // Hanya ambil nama bulannya (misal "Jul") untuk X-Axis agar lebih bersih
    amount: trendMap[key]
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pemasukan</h1>
        <p className="text-gray-500 mt-2 text-sm">Catat pemasukan Anda dan biarkan sistem mengalokasikannya secara otomatis.</p>
      </div>

      <IncomeTrendChart data={trendData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <IncomeForm />
        </div>

        <div className="lg:col-span-2">
          <IncomeList />
        </div>
      </div>
    </div>
  );
}
