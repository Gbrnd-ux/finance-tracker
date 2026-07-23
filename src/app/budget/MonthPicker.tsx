"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function MonthPicker({ currentMonth }: { currentMonth: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("month", val);
    } else {
      params.delete("month");
    }
    router.push(`/budget?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">Pilih Bulan:</label>
      <input
        type="month"
        value={currentMonth}
        onChange={handleMonthChange}
        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      />
    </div>
  );
}
