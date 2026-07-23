"use client";

import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

type AllocationData = {
  name: string;
  value: number;
  color: string;
};

type IncomeVsBillData = {
  name: string;
  Pemasukan: number;
  Tagihan: number;
};

export default function DashboardCharts({ 
  allocationData, 
  incomeVsBillData 
}: { 
  allocationData: AllocationData[],
  incomeVsBillData: IncomeVsBillData[]
}) {

  // Custom Tooltip format to show Rupiah
  const formatRupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* CARD 1: PIE CHART ALOKASI */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 border-b pb-3">Distribusi Alokasi Budget</h2>
        
        {allocationData.length > 0 ? (
          <div className="flex-1 w-full min-h-[240px] sm:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: any) => formatRupiah(value as number)} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[240px] sm:min-h-[300px] text-gray-400">
            Belum ada data alokasi bulan ini.
          </div>
        )}
      </div>

      {/* CARD 2: BAR CHART PEMASUKAN VS PENGELUARAN */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 border-b pb-3">Pemasukan vs Tagihan</h2>
        
        <div className="flex-1 w-full min-h-[240px] sm:min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={incomeVsBillData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis 
                tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}Jt`} 
                axisLine={false} 
                tickLine={false} 
              />
              <RechartsTooltip 
                formatter={(value: any) => formatRupiah(value as number)}
                cursor={{ fill: 'transparent' }}
              />
              <Legend />
              <Bar dataKey="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tagihan" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
