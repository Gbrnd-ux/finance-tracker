"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function BillForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [billType, setBillType] = useState("LISTRIK");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      type: formData.get("type"),
      vehiclePlate: formData.get("vehiclePlate"),
      amount: formData.get("amount"),
      dueDate: formData.get("dueDate"),
      recurring: formData.get("recurring"),
    };

    // Validasi tambahan di client-side: pastikan dueDate bukan di masa lalu
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(data.dueDate as string);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setMessage({ type: "error", text: "Tanggal jatuh tempo tidak boleh di masa lalu!" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Tagihan berhasil didaftarkan!" });
        formRef.current?.reset();
        router.refresh();
      } else {
        setMessage({ type: "error", text: json.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Koneksi terputus saat menyimpan tagihan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100/50 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="mb-8 relative z-10">
        <h2 className="text-2xl font-bold text-gray-800">Daftarkan Tagihan Baru</h2>
        <p className="text-gray-500 mt-1">
          Catat pengeluaran wajib agar Anda tidak pernah melewatkan jatuh tempo.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium relative z-10 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Tagihan</label>
          <input
            type="text"
            name="name"
            required
            placeholder="Contoh: Cicilan KPR, Listrik Bulanan..."
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Tagihan</label>
            <select
              name="type"
              required
              value={billType}
              onChange={(e) => setBillType(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            >
              <option value="LISTRIK">Listrik & Air</option>
              <option value="INTERNET">Internet & Pulsa</option>
              <option value="KENDARAAN">Cicilan Kendaraan</option>
              <option value="PROPERTI">KPR / Sewa Rumah</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nominal (Rp)</label>
            <input
              type="number"
              name="amount"
              min="1"
              required
              placeholder="Contoh: 500000"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {billType === "KENDARAAN" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Plat Nomor Kendaraan</label>
            <input
              type="text"
              name="vehiclePlate"
              required
              placeholder="Contoh: B 1234 XYZ"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Jatuh Tempo</label>
            <input
              type="date"
              name="dueDate"
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Perulangan</label>
            <select
              name="recurring"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            >
              <option value="NONE">Sekali Saja (Tidak Berulang)</option>
              <option value="MONTHLY">Bulanan</option>
              <option value="YEARLY">Tahunan</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Menyimpan...</span>
            </>
          ) : (
            "Daftarkan Tagihan"
          )}
        </button>
      </form>
    </div>
  );
}
