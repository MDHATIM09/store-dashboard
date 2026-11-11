"use client";

import React from "react";
import { Store, ShieldCheck, RefreshCw, Lock } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  storeName?: string;
  lowStockCount: number;
  onOpenLowStock: () => void;
  onLock?: () => void;
}

export default function Header({
  onRefresh,
  isRefreshing,
  storeName = "Parilok Store",
  lowStockCount,
  onOpenLowStock,
  onLock,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#0f766e] text-white px-4 py-3 shadow-md">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <Store className="w-5 h-5 text-teal-100" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-tight flex items-center gap-1.5">
              <span>{storeName}</span>
              <span className="text-[10px] uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded font-medium text-teal-100">
                POS
              </span>
            </h1>
            <p className="text-[11px] text-teal-200/90 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              <span>Admin Dashboard</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {lowStockCount > 0 && (
            <button
              onClick={onOpenLowStock}
              className="px-2.5 py-1 bg-amber-500/20 border border-amber-300/40 text-amber-200 rounded-full text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>{lowStockCount} Low</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-all ${
              isRefreshing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-teal-200" : ""}`} />
          </button>

          {onLock && (
            <button
              onClick={onLock}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-rose-500/30 active:scale-90 transition-all"
              title="Lock Dashboard"
            >
              <Lock className="w-4 h-4 text-teal-200" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
