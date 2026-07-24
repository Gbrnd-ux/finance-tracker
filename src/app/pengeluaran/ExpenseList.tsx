"use client";

import { Expense, Category } from "@prisma/client";
import { deleteExpense } from "@/app/actions/expense";
import { useState } from "react";

type ExpenseWithCategory = Expense & { category: Category };

export default function ExpenseList({ expenses }: { expenses: ExpenseWithCategory[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, description: string) => {
    if (confirm(`Yakin ingin menghapus pengeluaran "${description}"?`)) {
      setIsDeleting(id);
      await deleteExpense(id);
      setIsDeleting(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-800">Riwayat Pengeluaran</h2>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-white/50 border-t border-gray-100 p-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">Belum ada pengeluaran</h3>
          <p className="text-gray-500 max-w-sm">
            Catat pengeluaran pertama Anda di form atas agar sisa budget dapat dilacak dengan baik.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {expenses.map((expense) => (
            <li key={expense.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                  style={{ backgroundColor: expense.category.color || '#8B5CF6' }}
                >
                  {expense.category.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{expense.description}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {expense.category.name}
                    </span>
                    <p className="text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="font-bold text-rose-600">
                  - Rp {expense.amount.toLocaleString("id-ID")}
                </p>
                <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(expense.id, expense.description)}
                    disabled={isDeleting === expense.id}
                    className="text-xs px-3 py-1.5 font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                  >
                    {isDeleting === expense.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
