import { prisma } from "@/lib/prisma";
import BudgetSettings from "./BudgetSettings";
import MonthPicker from "./MonthPicker";
import BudgetPieChart from "./BudgetPieChart";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

import { auth } from "@/lib/auth";

export default async function BudgetPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const params = await searchParams;
  const monthParam = typeof params.month === 'string' ? params.month : "";
  
  // Penentuan bulan filter (default: bulan ini)
  let year: number;
  let month: number;
  
  if (monthParam) {
    const parts = monthParam.split("-");
    year = parseInt(parts[0]);
    month = parseInt(parts[1]) - 1; // JS months are 0-indexed
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
  
  const currentMonthString = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" }
  });

  const latestIncome = await prisma.income.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    include: {
      allocations: {
        include: {
          category: true,
        },
      },
    },
  });

  // Query agregasi untuk total budget per kategori di bulan terpilih
  const monthlyAllocations = await prisma.allocation.groupBy({
    by: ['categoryId'],
    where: {
      income: {
        userId,
        date: { gte: startDate, lte: endDate }
      }
    },
    _sum: { amount: true }
  });

  const totalMonthlyIncome = monthlyAllocations.reduce((sum, alloc) => sum + (alloc._sum.amount || 0), 0);

  // Siapkan data untuk Pie Chart
  const pieChartData = categories.map(cat => {
    const alloc = monthlyAllocations.find(a => a.categoryId === cat.id);
    return {
      name: cat.name,
      value: alloc?._sum.amount || 0,
      color: cat.color || "#ccc"
    };
  }).filter(data => data.value > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Budget & Alokasi</h1>
        <p className="text-gray-500 mt-2 text-sm">Atur persentase otomatis untuk setiap kategori keuangan Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <BudgetSettings initialCategories={categories} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Alokasi Pemasukan Terakhir</h2>
          
          {!latestIncome ? (
            <div className="bg-white/50 border border-gray-100 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center h-full">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">Belum Ada Pemasukan</h3>
              <p className="text-gray-500 max-w-xs">Catat pemasukan pertama Anda di menu Pemasukan agar alokasi otomatis bisa bekerja.</p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-sm text-gray-500">Sumber Pemasukan</p>
                <h3 className="text-lg font-bold text-gray-800">{latestIncome.source}</h3>
                <p className="font-bold text-2xl text-emerald-600 mt-1">
                  Rp {latestIncome.amount.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(latestIncome.date).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">Pecahan Alokasi:</p>
                {latestIncome.allocations.map((alloc) => (
                  <div key={alloc.id} className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: alloc.category.color || "#ccc" }} 
                      />
                      <span className="font-medium text-gray-700">{alloc.category.name}</span>
                    </div>
                    <span className="font-bold text-gray-800">
                      Rp {alloc.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 pt-12 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Akumulasi Saldo Bulanan</h2>
            <p className="text-gray-500 mt-1">Total uang yang dialokasikan berdasarkan filter bulan.</p>
          </div>
          <MonthPicker currentMonth={currentMonthString} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:col-span-2">
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Saldo Terkumpul Bulan Ini</p>
              <p className="text-4xl font-black text-gray-900">Rp {totalMonthlyIncome.toLocaleString("id-ID")}</p>
            </div>

            {categories.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-400 mb-4 shadow-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">Tidak Ada Kategori</h3>
                <p className="text-gray-500">Anda belum mengatur kategori budget apapun.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => {
                const alloc = monthlyAllocations.find(a => a.categoryId === cat.id);
                const amount = alloc?._sum.amount || 0;
                
                return (
                  <div key={cat.id} className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: cat.color || "#ccc" }} 
                      />
                      <span className="font-bold text-gray-700">{cat.name}</span>
                    </div>
                    <div className="mt-auto">
                      <p className="text-sm text-gray-500 mb-1">Saldo Tersedia:</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        Rp {amount.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:col-span-1 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Proporsi Alokasi</h3>
            <BudgetPieChart data={pieChartData} />
          </div>
        </div>
      </div>
    </div>
  );
}
