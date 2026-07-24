import { prisma } from "@/lib/prisma";
import ReminderNotification from "./components/ReminderNotification";
import DashboardCharts from "./components/DashboardCharts";
import DashboardDateFilter from "./components/DashboardDateFilter";
import Link from "next/link";
import { Wallet, PieChart as PieIcon, BellRing } from "lucide-react";
import { Suspense } from "react";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

import { auth } from "@/lib/auth";

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const params = await searchParams;
  const fromParam = typeof params.from === "string" ? params.from : "";
  const toParam = typeof params.to === "string" ? params.to : "";

  const now = new Date();

  // Tentukan rentang tanggal dari filter atau default ke bulan ini
  const startDate: Date = fromParam
    ? new Date(fromParam + "T00:00:00")
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const endDate: Date = toParam
    ? new Date(toParam + "T23:59:59")
    : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const isFiltered = !!(fromParam || toParam);

  const formatDisplayDate = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  // 1. Ambil Reminder Aktif (tidak terpengaruh filter tanggal)
  const activeReminders = await prisma.reminder.findMany({
    where: {
      bill: { userId, isPaid: false },
      isSent: false,
    },
    include: { bill: true },
    orderBy: { remindAt: "asc" },
  });

  // 2. Agregasi Total Pemasukan dalam rentang terpilih
  const incomeResult = await prisma.income.aggregate({
    _sum: { amount: true },
    where: { userId, date: { gte: startDate, lte: endDate } },
  });
  const totalIncome = incomeResult._sum.amount || 0;

  // 3. Agregasi Total Alokasi dalam rentang terpilih
  const allocationResult = await prisma.allocation.aggregate({
    _sum: { amount: true },
    where: { income: { userId }, createdAt: { gte: startDate, lte: endDate } },
  });
  const totalAllocated = allocationResult._sum.amount || 0;

  // 3.5 Agregasi Total Pengeluaran dalam rentang terpilih
  const expenseResult = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { userId, date: { gte: startDate, lte: endDate } },
  });
  const totalExpense = expenseResult._sum.amount || 0;
  
  const sisaSaldo = totalIncome - totalExpense;

  // 4. Agregasi Tagihan Belum Lunas (tidak bergantung pada rentang tanggal)
  const pendingBillsResult = await prisma.bill.aggregate({
    _sum: { amount: true },
    _count: { id: true },
    where: { userId, isPaid: false },
  });
  const totalPendingBillsAmount = pendingBillsResult._sum.amount || 0;
  const pendingBillsCount = pendingBillsResult._count.id;

  // 5. Data Pie Chart: Alokasi per Kategori dalam rentang terpilih
  const categories = await prisma.category.findMany({ where: { userId } });
  const allocationsGrouped = await prisma.allocation.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
    where: { income: { userId }, createdAt: { gte: startDate, lte: endDate } },
  });

  const pieChartData = allocationsGrouped
    .map((group) => {
      const category = categories.find((c) => c.id === group.categoryId);
      return {
        name: category?.name || "Lainnya",
        value: group._sum.amount || 0,
        color: category?.color || "#cbd5e1",
      };
    })
    .filter((data) => data.value > 0);

  // 6. Data Bar Chart: Pemasukan vs Tagihan
  const barChartData = [
    {
      name: isFiltered ? "Rentang Dipilih" : "Bulan Ini",
      Pemasukan: totalIncome,
      Tagihan: totalPendingBillsAmount,
    },
  ];

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  // ── Smart Insights ──────────────────────────────────────────────
  const unallocated = totalIncome - totalAllocated;
  const allocationPct = totalIncome > 0
    ? Math.round((totalAllocated / totalIncome) * 100)
    : 0;

  type Insight = { type: "success" | "warning" | "danger" | "info"; message: string };
  const insights: Insight[] = [];

  if (totalIncome === 0) {
    insights.push({ type: "info", message: "Belum ada pemasukan yang dicatat pada periode ini. Yuk catat gaji atau pendapatan pertama Anda!" });
  } else if (unallocated === 0) {
    insights.push({ type: "success", message: `✅ Kamu sudah mengalokasikan 100% dari pemasukan (${formatRupiah(totalIncome)}). Keuangan kamu rapi dan terkontrol!` });
  } else if (unallocated > 0) {
    insights.push({ type: "warning", message: `⚠️ Masih ada ${formatRupiah(unallocated)} (${100 - allocationPct}%) dari pemasukan yang belum dialokasikan ke kategori manapun.` });
  } else {
    // unallocated < 0 artinya alokasi melebihi pemasukan
    insights.push({ type: "danger", message: `🚨 Total alokasi melebihi pemasukan sebesar ${formatRupiah(Math.abs(unallocated))}! Periksa kembali pos pengeluaran Anda.` });
  }

  if (pendingBillsCount > 0) {
    insights.push({ type: "warning", message: `🧾 Ada ${pendingBillsCount} tagihan belum lunas senilai total ${formatRupiah(totalPendingBillsAmount)}. Jangan sampai terlewat!` });
  }

  if (activeReminders.length > 0) {
    insights.push({ type: "danger", message: `🔔 ${activeReminders.length} tagihan mendekati jatuh tempo dalam 3 hari ke depan. Segera lunasi sebelum terlambat!` });
  }

  if (totalIncome > 0 && pendingBillsCount === 0 && unallocated === 0) {
    insights.push({ type: "success", message: "🎉 Semua tagihan sudah lunas dan alokasi 100% terpenuhi. Kondisi keuangan bulan ini sempurna!" });
  }

  const insightStyle: Record<Insight["type"], string> = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    danger:  "bg-red-50 border-red-200 text-red-800",
    info:    "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* HEADER + FILTER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {isFiltered
              ? `Menampilkan data dari ${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`
              : "Ringkasan kondisi keuangan Anda bulan ini."}
          </p>
        </div>

        <Suspense fallback={null}>
          <DashboardDateFilter from={fromParam} to={toParam} />
        </Suspense>
      </div>

      {/* SECTION NOTIFIKASI REMINDER */}
      {activeReminders.length > 0 && (
        <div className="space-y-3">
          {activeReminders.map((reminder) => (
            <ReminderNotification
              key={reminder.id}
              reminder={{
                id: reminder.id,
                billName: reminder.bill.name,
                amount: reminder.bill.amount,
                dueDate: reminder.bill.dueDate,
              }}
            />
          ))}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mr-4 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 mb-1 truncate">
              {isFiltered ? "Pemasukan (Filter)" : "Pemasukan (Bulan Ini)"}
            </p>
            <h3 className="text-xl font-bold text-gray-900 truncate">{formatRupiah(totalIncome)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mr-4 shrink-0">
            <PieIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 mb-1 truncate">Total Pengeluaran</p>
            <h3 className="text-xl font-bold text-gray-900 truncate">{formatRupiah(totalExpense)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 mb-1 truncate">Sisa Saldo Aktif</p>
            <h3 className={`text-xl font-bold truncate ${sisaSaldo < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatRupiah(sisaSaldo)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mr-4 shrink-0">
            <BellRing className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 mb-1 truncate">
              Tagihan Belum Lunas
            </p>
            <h3 className="text-xl font-bold text-amber-600 truncate">{formatRupiah(totalPendingBillsAmount)}</h3>
          </div>
        </div>
      </div>

      {/* ── SMART INSIGHTS ── */}
      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 px-5 py-4 rounded-2xl border text-sm font-medium leading-relaxed ${insightStyle[insight.type]}`}
            >
              {insight.message}
            </div>
          ))}
        </div>
      )}

      {/* CHARTS SECTION */}
      <DashboardCharts allocationData={pieChartData} incomeVsBillData={barChartData} />

      {/* QUICK ACTIONS */}
      <div className="pt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/pemasukan"
            className="block p-6 bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 rounded-2xl transition-colors"
          >
            <h3 className="text-lg font-bold text-blue-800 mb-1">Catat Pemasukan</h3>
            <p className="text-blue-600/80 text-sm">Tambah uang masuk.</p>
          </Link>
          <Link
            href="/pengeluaran"
            className="block p-6 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/50 rounded-2xl transition-colors"
          >
            <h3 className="text-lg font-bold text-rose-800 mb-1">Catat Pengeluaran</h3>
            <p className="text-rose-600/80 text-sm">Catat pengeluaran baru.</p>
          </Link>
          <Link
            href="/budget"
            className="block p-6 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/50 rounded-2xl transition-colors"
          >
            <h3 className="text-lg font-bold text-emerald-800 mb-1">Atur Budget</h3>
            <p className="text-emerald-600/80 text-sm">Lihat sisa alokasi.</p>
          </Link>
          <Link
            href="/tagihan"
            className="block p-6 bg-amber-50/50 hover:bg-amber-50 border border-amber-100/50 rounded-2xl transition-colors"
          >
            <h3 className="text-lg font-bold text-amber-800 mb-1">Kelola Tagihan</h3>
            <p className="text-amber-600/80 text-sm">Cek tagihan wajib.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
