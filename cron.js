const cron = require("node-cron");

console.log("Memulai Cron Scheduler untuk Finance Tracker...");

// Penjadwalan: Berjalan setiap hari pada jam 07:00 pagi
// Format Cron: Menit Jam Tanggal Bulan Hari
cron.schedule("0 7 * * *", async () => {
  console.log(`[${new Date().toLocaleString()}] Menjalankan pengecekan reminder harian...`);
  
  try {
    // Memanggil endpoint Next.js yang sudah kita buat
    const response = await fetch("http://localhost:3000/api/cron/reminders");
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Berhasil: ${data.message}`);
    } else {
      console.error("❌ Gagal menjalankan cron:", data.error);
    }
  } catch (error) {
    console.error("⚠️ Error koneksi: Pastikan server Next.js (npm run dev) sedang berjalan.", error.message);
  }
});

console.log("⏰ Scheduler aktif! Menunggu jadwal pukul 07:00 setiap harinya.");
