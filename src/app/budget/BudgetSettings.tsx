"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  color: string | null;
  defaultPercentage: number;
}

export default function BudgetSettings({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#3B82F6");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const totalPercentage = categories.reduce((sum, cat) => sum + cat.defaultPercentage, 0);
  const isTotalValid = totalPercentage === 100;

  const handlePercentageChange = (id: string, value: string) => {
    let numValue = parseInt(value) || 0;
    if (numValue < 0) numValue = 0;
    if (numValue > 100) numValue = 100;

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, defaultPercentage: numValue } : cat
      )
    );
  };

  const handleSave = async () => {
    if (!isTotalValid) {
      setMessage({ type: "error", text: `Total alokasi harus 100%! Saat ini: ${totalPercentage}%` });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categories.map(c => ({ id: c.id, defaultPercentage: c.defaultPercentage }))),
      });

      const json = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: json.message });
        router.refresh();
      } else {
        setMessage({ type: "error", text: json.error });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi saat menyimpan." });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsAdding(true);
    
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, color: newCatColor }),
      });
      if (res.ok) {
        setNewCatName("");
        setMessage({ type: "success", text: "Kategori baru berhasil ditambahkan! Sesuaikan persentase di bawah." });
        router.refresh();
      } else {
        const json = await res.json();
        setMessage({ type: "error", text: json.error });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Gagal menambah kategori" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus kategori "${name}"? SEMUA riwayat uang yang dialokasikan ke kategori ini akan ikut TERHAPUS.`)) return;
    
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Kategori berhasil dihapus!" });
        router.refresh();
      } else {
        const json = await res.json();
        setMessage({ type: "error", text: json.error });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Gagal menghapus kategori" });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Pengaturan Alokasi Otomatis</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tentukan persentase ke mana pemasukan Anda akan dipecah otomatis.
          </p>
        </div>
        
        <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${isTotalValid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          Total: {totalPercentage}%
          {!isTotalValid && <span className="text-xs font-normal"> (Harus 100%)</span>}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4 mb-8">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: cat.color || "#ccc" }} 
              />
              <span className="font-semibold text-gray-700">{cat.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={cat.defaultPercentage}
                onChange={(e) => handlePercentageChange(cat.id, e.target.value)}
                className="w-20 text-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <span className="text-gray-500 font-medium mr-2">%</span>
              <button
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                title="Hapus Kategori"
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddCategory} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-6">
        <input
          type="color"
          value={newCatColor}
          onChange={(e) => setNewCatColor(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
          title="Pilih Warna"
        />
        <input
          type="text"
          placeholder="Nama Kategori Baru..."
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={isAdding || !newCatName.trim()}
          className="px-4 py-2 bg-gray-800 hover:bg-black text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-70"
        >
          {isAdding ? "..." : "Tambah"}
        </button>
      </form>

      <button
        onClick={handleSave}
        disabled={loading || !isTotalValid}
        className="w-full md:w-auto md:px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {loading ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>
    </div>
  );
}
