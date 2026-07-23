/**
 * Utilitas untuk mengirim pesan ke Telegram Bot.
 * Pastikan TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID sudah diset di file .env
 */
export async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("\n=============================================");
    console.warn("⚠️ SIMULASI PENGIRIMAN TELEGRAM (Karena .env kosong):");
    console.warn(message);
    console.warn("=============================================\n");
    return false;
  }

  const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML", // Memungkinkan kita mengirim teks tebal/miring
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gagal mengirim Telegram:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Koneksi terputus saat menghubungi Telegram API:", error);
    return false;
  }
}
