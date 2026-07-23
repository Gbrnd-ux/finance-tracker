"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarRange, RotateCcw } from "lucide-react";

export default function DashboardDateFilter({
  from,
  to,
}: {
  from: string;
  to: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [fromVal, setFromVal] = useState(from);
  const [toVal, setToVal] = useState(to);

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (fromVal) params.set("from", fromVal);
    if (toVal) params.set("to", toVal);
    startTransition(() => router.push(`/?${params.toString()}`));
  };

  const resetFilter = () => {
    setFromVal("");
    setToVal("");
    startTransition(() => router.push("/"));
  };

  const isFiltered = searchParams.get("from") || searchParams.get("to");

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto">
      {/* Input tanggal: di mobile full-width & stacked, di sm+ inline */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="date"
            value={fromVal}
            onChange={(e) => setFromVal(e.target.value)}
            className="text-sm text-gray-700 bg-transparent border-none outline-none cursor-pointer w-full"
          />
        </div>
        <span className="hidden sm:block text-gray-300 text-xs">–</span>
        <input
          type="date"
          value={toVal}
          onChange={(e) => setToVal(e.target.value)}
          className="text-sm text-gray-700 bg-transparent border-none outline-none cursor-pointer w-full"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={applyFilter}
          disabled={isPending}
          className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-2xl shadow-sm transition-colors disabled:opacity-50"
        >
          {isPending ? "Memuat..." : "Terapkan"}
        </button>

        {isFiltered && (
          <button
            onClick={resetFilter}
            disabled={isPending}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-2xl transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
