import { Category, Allocation } from "@prisma/client";

/**
 * Menghitung pecahan alokasi baru berdasarkan nominal uang dan daftar persentase kategori.
 * Fungsi ini murni (pure function) sehingga mudah diuji (unit testing).
 * 
 * @param amount Nominal uang masuk
 * @param categories Daftar kategori beserta `defaultPercentage`-nya
 * @returns Array berisi data `categoryId` dan nominal `amount` alokasi
 */
export function calculateNewAllocations(amount: number, categories: Category[]) {
  if (!categories || categories.length === 0) return [];

  return categories.map((cat) => {
    const allocationAmount = (amount * cat.defaultPercentage) / 100;
    return {
      categoryId: cat.id,
      amount: allocationAmount,
    };
  });
}

/**
 * Menyesuaikan pecahan alokasi lama menggunakan skala rasio proporsional, 
 * agar persentase masa lalu tetap utuh meskipun total uang pemasukan diubah.
 * 
 * @param newAmount Nominal uang baru setelah diedit
 * @param oldAmount Nominal uang lama sebelum diedit
 * @param oldAllocations Daftar objek alokasi lama
 * @returns Array berisi `id` alokasi dan nominal `amount` yang sudah diperbarui
 */
export function calculateScaledAllocations(newAmount: number, oldAmount: number, oldAllocations: Allocation[]) {
  if (oldAmount <= 0 || newAmount === oldAmount || !oldAllocations || oldAllocations.length === 0) {
    return [];
  }

  const ratio = newAmount / oldAmount;
  
  return oldAllocations.map(alloc => ({
    id: alloc.id,
    amount: alloc.amount * ratio
  }));
}
