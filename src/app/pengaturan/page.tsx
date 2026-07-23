import { getSetting } from "@/app/actions/settings";
import SettingsForm from "./SettingsForm";

export default async function PengaturanPage() {
  const notifEnabled = await getSetting("NOTIFICATIONS_ENABLED", "true");

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pengaturan</h1>
        <p className="text-gray-500 mt-2 text-sm">Sesuaikan preferensi aplikasi Anda.</p>
      </header>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Preferensi Notifikasi</h2>
        <SettingsForm initialNotif={notifEnabled} />
      </div>
    </div>
  );
}
