"use client";

import React from "react";
import { Store, Package, Receipt, Plus } from "lucide-react";

export type ActiveTab = "dashboard" | "products" | "sales";

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewSale: () => void;
}

export default function BottomNav({
  activeTab,
  onSelectTab,
  onOpenNewSale,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => onSelectTab("dashboard")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "dashboard"
              ? "text-[#0f766e] font-semibold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Store className={`w-5 h-5 ${activeTab === "dashboard" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[11px] mt-0.5">Home</span>
        </button>

        {/* Center Prominent: + New Sale Button */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={onOpenNewSale}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-[#10b981] text-white shadow-lg shadow-emerald-500/30 hover:bg-[#059669] active:scale-95 transition-all border-4 border-white"
            title="New Sale"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* Tab 2: Products */}
        <button
          onClick={() => onSelectTab("products")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "products"
              ? "text-[#0f766e] font-semibold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Package className={`w-5 h-5 ${activeTab === "products" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[11px] mt-0.5">Stock</span>
        </button>

        {/* Tab 3: Sales History */}
        <button
          onClick={() => onSelectTab("sales")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "sales"
              ? "text-[#0f766e] font-semibold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Receipt className={`w-5 h-5 ${activeTab === "sales" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[11px] mt-0.5">History</span>
        </button>
      </div>
    </nav>
  );
}

