import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTargetDateRange, formatIndonesianDate } from "@/lib/dates";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET(request: Request) {
  // Perlindungan Vercel Cron Jobs menggunakan Bearer Token
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // 0. Ambil semua pengaturan notifikasi per user
    const notificationSettings = await prisma.setting.findMany({ 
      where: { key: "NOTIFICATIONS_ENABLED", value: "true" } 
    });
    
    // User ID yang mengaktifkan notifikasi
    const enabledUserIds = notificationSettings.map(s => s.userId);

    if (enabledUserIds.length === 0) {
      return NextResponse.json({ success: true, message: "Cron dihentikan: Tidak ada user yang mengaktifkan notifikasi." });
    }

    // 1. Tentukan rentang waktu H-3 (Hari ini + 3 hari)
    const { start: targetDateStart, end: targetDateEnd } = getTargetDateRange(3);

    // 2. Cari semua tagihan belum lunas dari user yang mengaktifkan notifikasi dan jatuh tempo H-3
    const upcomingBills = await prisma.bill.findMany({
      where: {
        userId: { in: enabledUserIds },
        isPaid: false,
        dueDate: {
          gte: targetDateStart,
          lte: targetDateEnd,
        },
      },
      include: {
        reminders: true, 
      }
    });

    let createdCount = 0;

    // 3. Buat reminder untuk masing-masing tagihan (jika belum pernah dibuat)
    for (const bill of upcomingBills) {
      const hasAnyReminder = bill.reminders.length > 0;

      if (!hasAnyReminder) {
        await prisma.reminder.create({
          data: {
            billId: bill.id,
            remindAt: new Date(), 
            isSent: false,
          },
        });
        createdCount++;

        // KEMUDIAN: Kirim notifikasi nyata ke Telegram!
        const rpAmount = bill.amount.toLocaleString("id-ID");
        const niceDate = formatIndonesianDate(bill.dueDate);
        const teleMessage = `🚨 <b>TAGIHAN JATUH TEMPO (H-3)</b> 🚨\n\nHalo!\nIni adalah pengingat otomatis bahwa tagihan <b>${bill.name}</b> sebesar <b>Rp ${rpAmount}</b> akan jatuh tempo pada <b>${niceDate}</b>.\n\nHarap segera disiapkan dan dilunasi agar tidak terkena denda.`;
        
        const isSuccess = await sendTelegramMessage(teleMessage);
        console.log(`[LOG] Reminder untuk "${bill.name}" berhasil dicatat di DB. Notifikasi Telegram terkirim: ${isSuccess}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pengecekan selesai. ${createdCount} pengingat baru berhasil dibuat untuk tagihan H-3.`,
      billsChecked: upcomingBills.length,
    });
  } catch (error) {
    console.error("Gagal menjalankan cron reminder:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada cron" },
      { status: 500 }
    );
  }
}
