"use client";

import { useRef, useState, FormEvent } from "react";

export default function IncomeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData.entries());
    
    // Validasi Manual Client-Side
    if (!data.date) {
      setMessage({ type: "error", text: "Tanggal tidak boleh kosong!" });
      setLoading(false);
      return;
    }
    
    const amountNum = parseFloat(data.amount as string);
    if (isNaN(amountNum) || amountNum <= 0) {
      setMessage({ type: "error", text: "Jumlah harus berupa angka positif!" });
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        setMessage({ type: "error", text: json.error || "Gagal menyimpan data." });
      } else {
        setMessage({ type: "success", text: json.message || "Pemasukan berhasil dicatat!" });
        formRef.current.reset();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100/50">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Catat Pemasukan Baru</h2>
        <p className="text-sm text-gray-500 mt-1">
          Pemasukan akan otomatis dialokasikan ke berbagai kategori budget.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sumber Pemasukan</label>
          <input
            type="text"
            name="source"
            placeholder="Gaji Bulanan, Freelance..."
            required
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah (Rp)</label>
            <input
              type="number"
              name="amount"
              min="1"
              placeholder="10000000"
              required
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
            <input
              type="date"
              name="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Tambahkan catatan jika diperlukan..."
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            "Simpan Pemasukan"
          )}
        </button>
      </form>
    </div>
  );
}
