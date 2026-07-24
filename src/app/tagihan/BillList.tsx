"use client";

import { Bill } from "@prisma/client";
import { deleteBill, markBillAsPaid } from "@/app/actions/bills";
import { useState, useTransition } from "react";
import { isOverdue, isWithinNextDays, formatIndonesianDate } from "@/lib/dates";

export default function BillList({ bills }: { bills: Bill[] }) {
  const [filter, setFilter] = useState<"ALL" | "UNPAID" | "THIS_WEEK">("ALL");
  const [isPending, startTransition] = useTransition();

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await markBillAsPaid(id, currentStatus);
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus tagihan "${name}"?`)) {
      startTransition(async () => {
        const res = await deleteBill(id);
        if (res && !res.success) {
          alert(res.error || "Gagal menghapus tagihan.");
        }
      });
    }
  };

  const filteredBills = bills.filter(bill => {
    if (filter === "ALL") return true;
    if (filter === "UNPAID") return !bill.isPaid;
    
    if (filter === "THIS_WEEK") {
      return !bill.isPaid && isWithinNextDays(bill.dueDate, 7);
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Daftar Tagihan Anda</h2>
        
        <div className="flex bg-gray-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setFilter("ALL")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'ALL' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Semua
          </button>
          <button 
            onClick={() => setFilter("UNPAID")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'UNPAID' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Belum Lunas
          </button>
          <button 
            onClick={() => setFilter("THIS_WEEK")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'THIS_WEEK' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            7 Hari Ke Depan
          </button>
        </div>
      </div>

      {filteredBills.length === 0 ? (
        <div className="bg-white/50 border-t border-gray-100 p-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">Tidak ada tagihan</h3>
          <p className="text-gray-500 max-w-sm">
            {filter === "ALL" ? "Anda belum menambahkan tagihan apapun. Tagihan yang Anda buat akan muncul di sini." 
              : filter === "UNPAID" ? "Luar biasa! Tidak ada satupun tagihan yang tertunggak saat ini." 
              : "Santai, tidak ada tagihan yang harus dibayar dalam 7 hari ke depan."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {filteredBills.map((bill) => {
            // Logika Penentuan Status Badge
            let statusType = "BELUM_LUNAS"; // Default
            if (bill.isPaid) {
              statusType = "LUNAS";
            } else if (isOverdue(bill.dueDate)) {
              statusType = "TERLAMBAT";
            }

            // Rendering konfigurasi badge berdasarkan tipe
            let badgeColors = "";
            let badgeText = "";

            if (statusType === "LUNAS") {
              badgeColors = "bg-emerald-100 text-emerald-700 border-emerald-200";
              badgeText = "Lunas";
            } else if (statusType === "TERLAMBAT") {
              badgeColors = "bg-red-100 text-red-700 border-red-200";
              badgeText = "Terlambat";
            } else {
              badgeColors = "bg-amber-100 text-amber-700 border-amber-200";
              badgeText = "Belum Lunas";
            }

            return (
              <li key={bill.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Icon Placeholder based on type */}
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">{bill.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColors}`}>
                        {badgeText}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Jatuh Tempo: <span className="font-medium text-gray-700">{formatIndonesianDate(bill.dueDate)}</span></p>
                      <div className="flex gap-3 mt-1">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{bill.type}</span>
                        {bill.vehiclePlate && (
                          <span className="bg-purple-50 text-purple-700 font-mono px-2 py-1 rounded text-xs border border-purple-100">
                            {bill.vehiclePlate}
                          </span>
                        )}
                        {bill.recurring !== "NONE" && (
                          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">
                            {bill.recurring === "MONTHLY" ? "Bulanan" : "Tahunan"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col justify-between items-end sm:items-end sm:justify-start gap-3 mt-2 sm:mt-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Nominal Tagihan</p>
                    <p className="font-bold text-xl text-gray-800">Rp {bill.amount.toLocaleString("id-ID")}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(bill.id, bill.isPaid)}
                      disabled={isPending}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        bill.isPaid 
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                      }`}
                    >
                      {bill.isPaid ? 'Batal Lunas' : 'Tandai Lunas'}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(bill.id, bill.name)}
                      disabled={isPending}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus Tagihan"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
