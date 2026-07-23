"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type ChartData = {
  name: string;
  value: number;
  color: string;
};

export default function BudgetPieChart({ data }: { data: ChartData[] }) {
  const formatRupiah = (value: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
        Belum ada data alokasi bulan ini.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
               <Cell key={`cell-${index}`} fill={entry.color || "#ccc"} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => formatRupiah(value as number)} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
