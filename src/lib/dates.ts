/**
 * Menghitung tanggal jatuh tempo berikutnya berdasarkan tipe perulangan.
 */
export function calculateNextRecurringDate(currentDate: Date | string, recurring: string): Date {
  const nextDate = new Date(currentDate);

  if (recurring === "MONTHLY") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (recurring === "YEARLY") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }
  
  return nextDate;
}

/**
 * Mendapatkan rentang waktu (awal dan akhir hari) untuk target sekian hari ke depan.
 * Sangat berguna untuk logika cron job reminder H-X.
 */
export function getTargetDateRange(daysAhead: number): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() + daysAhead);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Mengecek apakah sebuah tagihan sudah terlambat (lewat dari tengah malam ini).
 */
export function isOverdue(dueDate: Date | string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(dueDate);
  target.setHours(0, 0, 0, 0);
  
  return target.getTime() < today.getTime();
}

/**
 * Mengecek apakah tanggal jatuh tempo berada dalam rentang N hari ke depan.
 */
export function isWithinNextDays(dueDate: Date | string, daysAhead: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(dueDate);
  target.setHours(0, 0, 0, 0);

  const endRange = new Date(today);
  endRange.setDate(endRange.getDate() + daysAhead);

  return target.getTime() >= today.getTime() && target.getTime() <= endRange.getTime();
}

/**
 * Memformat objek Date ke dalam string bahasa Indonesia yang mudah dibaca.
 */
export function formatIndonesianDate(date: Date | string, shortMonth: boolean = false): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: 'numeric',
    month: shortMonth ? 'short' : 'long',
    year: 'numeric'
  });
}
