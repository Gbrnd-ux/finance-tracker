"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Income {
  id: string;
  source: string;
  amount: number;
  date: Date;
  description: string | null;
}

export default function IncomeItem({ income }: { income: Income }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    source: income.source,
    amount: income.amount,
    date: new Date(income.date).toISOString().split("T")[0],
    description: income.description || "",
  });

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/income/${income.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal menghapus data.");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch(`/api/income/${income.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        const json = await res.json();
        alert(json.error || "Gagal memperbarui data.");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <li className="p-5 bg-blue-50/50 border border-blue-100 transition-colors">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sumber</label>
              <input
                type="text"
                required
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full text-sm border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Jumlah</label>
              <input
                type="number"
                min="1"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full text-sm border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-sm border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Catatan</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-sm border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-70"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
      <div>
        <h3 className="font-semibold text-gray-800">{income.source}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(income.date).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric"
          })}
        </p>
        {income.description && (
          <p className="text-sm text-gray-400 mt-1">{income.description}</p>
        )}
      </div>
      <div className="text-right flex flex-col items-end gap-2">
        <p className="font-bold text-emerald-600">
          + Rp {income.amount.toLocaleString("id-ID")}
        </p>
        <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity mt-1">
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs px-3 py-1.5 font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs px-3 py-1.5 font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
          >
            {isDeleting ? "..." : "Hapus"}
          </button>
        </div>
      </div>
    </li>
  );
}
