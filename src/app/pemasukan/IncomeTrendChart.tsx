"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type TrendData = {
  month: string;
  amount: number;
};

export default function IncomeTrendChart({ data }: { data: TrendData[] }) {
  const formatRupiah = (value: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
        Belum ada data pemasukan untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 w-full mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Tren Pemasukan (6 Bulan Terakhir)</h2>
      
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis 
              tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}Jt`} 
              axisLine={false} 
              tickLine={false} 
              width={80}
            />
            <Tooltip 
              formatter={(value: any) => [formatRupiah(value as number), "Pemasukan"]}
              labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#3B82F6" 
              strokeWidth={3}
              activeDot={{ r: 8, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
              dot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
