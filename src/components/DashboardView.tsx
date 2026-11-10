"use client";

import React from "react";
import {
  TrendingUp,
  AlertTriangle,
  Wallet,
  Calendar,
  Package,
  Plus,
  ArrowUpRight,
  Receipt,
  CreditCard,
  Banknote,
} from "lucide-react";
import { ProductItem, SaleRecord } from "@/lib/storeService";

interface DashboardStats {
  today: {
    total: number;
    cash: number;
    online: number;
    profit: number;
    count: number;
  };
  month: {
    total: number;
    profit: number;
    count: number;
  };
  weeklyTrend: Array<{
    date: string;
    label: string;
    sales: number;
    profit: number;
    count: number;
  }>;
  lowStockItems: ProductItem[];
  totalProductsCount: number;
  recentSales: SaleRecord[];
}

interface DashboardViewProps {
  stats: DashboardStats | null;
  onOpenNewSale: () => void;
  onGoToProducts: () => void;
  onGoToSales: () => void;
  onQuickRestock: (productId: string, delta: number) => void;
}

export default function DashboardView({
  stats,
  onOpenNewSale,
  onGoToProducts,
  onGoToSales,
  onQuickRestock,
}: DashboardViewProps) {
  if (!stats) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-44 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  // Max value for weekly trend scaling
  const maxWeeklySale = Math.max(...stats.weeklyTrend.map((d) => d.sales), 100);

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* 1. Low Stock Alert Banner (If any) */}
      {stats.lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-amber-900">
                  Low Stock Warning ({stats.lowStockItems.length} Products)
                </h3>
                <p className="text-[11px] text-amber-700">Stock is running out quickly!</p>
              </div>
            </div>
            <button
              onClick={onGoToProducts}
              className="text-xs font-semibold text-[#0f766e] hover:underline flex items-center"
            >
              Manage
            </button>
          </div>

          <div className="space-y-2 mt-2">
            {stats.lowStockItems.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-100 text-xs shadow-xs"
              >
                <div className="truncate pr-2">
                  <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">
                    CP: ₹{p.costPrice} | SP: ₹{p.sellingPrice}
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[11px]">
                    {p.stock} left
                  </span>
                  <button
                    onClick={() => onQuickRestock(p.id, 5)}
                    className="p-1 rounded-lg bg-slate-100 hover:bg-[#0f766e] hover:text-white text-slate-700 text-[10px] font-bold active:scale-95 transition-all flex items-center gap-0.5"
                    title="Add +5 Stock"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+5</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Today's Snapshot Card (Deep Teal Gradient) */}
      <div className="bg-gradient-to-br from-[#0f766e] to-[#115e59] text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase tracking-wider text-teal-200 font-semibold flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Today&apos;s Total Sales
          </span>
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
            {stats.today.count} orders
          </span>
        </div>

        <div className="mt-1 flex items-baseline justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight">
            ₹{stats.today.total.toLocaleString("en-IN")}
          </h2>
          <div className="text-right">
            <span className="text-[11px] text-teal-200 block">Today&apos;s Profit</span>
            <span className="text-sm font-bold text-emerald-300">
              +₹{stats.today.profit.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Split: Cash vs Online */}
        <div className="mt-3 pt-3 border-t border-white/15 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1.5 bg-black/10 px-2.5 py-1.5 rounded-xl">
            <Banknote className="w-4 h-4 text-emerald-300 shrink-0" />
            <div>
              <span className="text-[10px] text-teal-200 block leading-tight">Cash</span>
              <span className="font-bold">₹{stats.today.cash.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 bg-black/10 px-2.5 py-1.5 rounded-xl">
            <CreditCard className="w-4 h-4 text-teal-200 shrink-0" />
            <div>
              <span className="text-[10px] text-teal-200 block leading-tight">Online (UPI)</span>
              <span className="font-bold">₹{stats.today.online.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Monthly Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Monthly Sales */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0f766e]" />
              This Month
            </span>
            <span className="text-[10px] text-slate-400">{stats.month.count} sales</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">
            ₹{stats.month.total.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-500 block mt-0.5">Total Revenue</span>
        </div>

        {/* Monthly Profit */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
              Net Profit
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              P&L
            </span>
          </div>
          <p
            className={`text-xl font-bold mt-1 ${
              stats.month.profit >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {stats.month.profit >= 0 ? "+" : ""}₹{stats.month.profit.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-500 block mt-0.5">SP - CP - Discount</span>
        </div>
      </div>

      {/* 4. Weekly Sales Bar Trend */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#0f766e]" />
              Weekly Sales Trend
            </h3>
            <p className="text-[11px] text-slate-400">Past 7 days performance</p>
          </div>
        </div>

        <div className="flex items-end justify-between h-32 pt-4 px-1 border-b border-slate-100">
          {stats.weeklyTrend.map((day) => {
            const heightPct = Math.round((day.sales / maxWeeklySale) * 100);
            return (
              <div key={day.date} className="flex flex-col items-center flex-1 mx-0.5 group">
                <span className="text-[9px] text-slate-500 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.sales > 0 ? `₹${day.sales}` : ""}
                </span>
                <div className="w-full max-w-[24px] bg-slate-100 rounded-t-md h-24 flex items-end overflow-hidden">
                  <div
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      day.sales > 0 ? "bg-[#0f766e] group-hover:bg-[#10b981]" : "bg-slate-200"
                    }`}
                  ></div>
                </div>
                <span className="text-[10px] font-medium text-slate-500 mt-2">{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Quick Actions Row */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenNewSale}
          className="bg-[#10b981] hover:bg-[#059669] text-white p-3.5 rounded-2xl font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Sale (+ Bill)</span>
        </button>

        <button
          onClick={onGoToProducts}
          className="bg-white border border-[#0f766e] text-[#0f766e] hover:bg-teal-50 p-3.5 rounded-2xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          <span>Add / View Stock</span>
        </button>
      </div>

      {/* 6. Recent Sales Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-[#0f766e]" />
            Recent Sales
          </h3>
          <button
            onClick={onGoToSales}
            className="text-xs font-semibold text-[#0f766e] hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats.recentSales.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Abhi koi sale record nahi hai. Click &quot;New Sale&quot; to begin!
          </div>
        ) : (
          <div className="space-y-2">
            {stats.recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-800">
                    {sale.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{new Date(sale.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span>•</span>
                    <span
                      className={`font-semibold ${
                        sale.paymentMode === "ONLINE" ? "text-teal-700" : "text-emerald-700"
                      }`}
                    >
                      {sale.paymentMode}
                    </span>
                    {sale.discount > 0 && (
                      <span className="text-amber-600">Disc: ₹{sale.discount}</span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="font-extrabold text-slate-900 text-sm block">
                    ₹{sale.totalAmount}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 block">
                    +₹{sale.profit} profit
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

