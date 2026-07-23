"use client";

import { toggleSetting } from "@/app/actions/settings";
import { useState } from "react";

export default function SettingsForm({ initialNotif }: { initialNotif: string }) {
  const [notifEnabled, setNotifEnabled] = useState(initialNotif === "true");
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleSetting("NOTIFICATIONS_ENABLED", notifEnabled ? "true" : "false");
    if (result.success && result.value) {
      setNotifEnabled(result.value === "true");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div>
        <h3 className="font-bold text-gray-900">Notifikasi Reminder (H-3)</h3>
        <p className="text-sm text-gray-500 mt-1">
          Kirimkan notifikasi ke Dashboard dan Telegram saat ada tagihan yang mendekati jatuh tempo.
        </p>
      </div>
      
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
          notifEnabled ? "bg-purple-600" : "bg-gray-200"
        } ${loading ? "opacity-50" : ""}`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            notifEnabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
