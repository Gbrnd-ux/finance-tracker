"use client";

import { dismissReminder } from "@/app/actions/reminders";
import { useState } from "react";
import { formatIndonesianDate } from "@/lib/dates";

type ReminderProps = {
  id: string;
  billName: string;
  amount: number;
  dueDate: Date;
};

export default function ReminderNotification({ reminder }: { reminder: ReminderProps }) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = async () => {
    setIsDismissing(true);
    await dismissReminder(reminder.id);
  };

  return (
    <div className={`flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-2xl transition-opacity ${isDismissing ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <div>
          <h3 className="font-bold text-red-900">Tagihan Jatuh Tempo!</h3>
          <p className="text-sm text-red-700 mt-0.5">
            <span className="font-bold">{reminder.billName}</span> sebesar <span className="font-bold">Rp {reminder.amount.toLocaleString("id-ID")}</span> harus dibayar sebelum <span className="font-bold">{formatIndonesianDate(reminder.dueDate, true)}</span>.
          </p>
        </div>
      </div>
      
      <button 
        onClick={handleDismiss}
        className="px-4 py-2 bg-white text-red-700 text-sm font-bold border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
      >
        Tutup
      </button>
    </div>
  );
}
