import { prisma } from "@/lib/prisma";
import IncomeItem from "./IncomeItem";

import { auth } from "@/lib/auth";

export default async function IncomeList() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const incomes = await prisma.income.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Riwayat Terakhir</h2>
      
      {incomes.length === 0 ? (
        <div className="bg-white/50 border border-gray-100 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">Belum Ada Pemasukan</h3>
          <p className="text-gray-500 max-w-sm">Anda belum mencatat pemasukan apapun. Silakan catat penghasilan Anda melalui form di samping.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {incomes.map((inc) => (
              <IncomeItem key={inc.id} income={inc} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
