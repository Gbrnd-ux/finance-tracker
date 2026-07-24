"use client";

import { useRef, useState } from "react";
import { addExpense } from "@/app/actions/expense";
import { Category } from "@prisma/client";

export default function ExpenseForm({ categories }: { categories: Category[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await addExpense(formData);

    if (result?.error) {
      alert(result.error);
    } else {
      formRef.current?.reset();
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Tambah Pengeluaran Baru</h2>
      
      {categories.length === 0 ? (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm border border-amber-200">
          Anda belum memiliki Kategori Budget. Harap ke menu Pengaturan Budget untuk membuat kategori terlebih dahulu sebelum menambahkan pengeluaran.
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Budget</label>
              <select
                name="categoryId"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50 outline-none transition-all"
              >
                <option value="">Pilih Kategori...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
              <input
                type="number"
                name="amount"
                min="1"
                required
                placeholder="Contoh: 50000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <input
                type="text"
                name="description"
                required
                placeholder="Contoh: Makan siang nasi padang"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                name="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>Tambah Pengeluaran</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
