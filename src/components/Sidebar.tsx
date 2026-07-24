"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Wallet, 
  PieChart, 
  BellRing,
  Settings,
  Menu,
  X,
  LogOut,
  Receipt
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Pemasukan", href: "/pemasukan", icon: Wallet },
  { name: "Pengeluaran", href: "/pengeluaran", icon: Receipt },
  { name: "Budget", href: "/budget", icon: PieChart },
  { name: "Tagihan", href: "/tagihan", icon: BellRing },
  { name: "Pengaturan", href: "/pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mr-3 shadow-md shadow-blue-500/20">
          <Wallet className="text-white w-4 h-4" />
        </div>
        <span className="font-bold text-xl text-gray-800 tracking-tight">FinTrack</span>
        {/* Tombol tutup (mobile only) */}
        <button
          className="ml-auto lg:hidden text-gray-400 hover:text-gray-700"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center px-3 py-2.5 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`w-5 h-5 mr-3 shrink-0 transition-colors duration-200 ${
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center w-full px-3 py-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 mr-3 text-gray-400 group-hover:text-red-500 transition-colors" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Topbar (mobile) ──────────────────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-100 flex items-center px-4 shadow-sm">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center ml-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mr-2">
            <Wallet className="text-white w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-gray-800 tracking-tight">FinTrack</span>
        </div>
      </header>

      {/* ── Drawer overlay (mobile) ──────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar drawer (mobile slide-in) ─────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 bg-white border-r border-gray-100 shadow-xl flex flex-col transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavLinks />
      </aside>

      {/* ── Sidebar (desktop, always visible) ────────────── */}
      <aside className="hidden lg:flex w-64 h-screen bg-white border-r border-gray-100 flex-col fixed left-0 top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <NavLinks />
      </aside>
    </>
  );
}
