"use client";

import React, { useState, useMemo } from "react";
import {
  Receipt,
  Search,
  Calendar,
  Banknote,
  CreditCard,
  ChevronDown,
  TrendingUp,
  Edit3,
} from "lucide-react";
import { SaleRecord } from "@/lib/storeService";
import EditSaleModal from "./EditSaleModal";

interface SalesHistoryViewProps {
  sales: SaleRecord[];
  onRefresh: () => void;
}

export default function SalesHistoryView({
  sales,
  onRefresh,
}: SalesHistoryViewProps) {
  const [filter, setFilter] = useState<"today" | "week" | "month" | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [editingSale, setEditingSale] = useState<SaleRecord | null>(null);

  // Filtered sales
  const filteredSales = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return sales.filter((s) => {
      const saleTime = new Date(s.createdAt).getTime();

      // Date filter
      if (filter === "today" && saleTime < startOfToday) return false;
      if (filter === "week" && saleTime < startOfWeek) return false;
      if (filter === "month" && saleTime < startOfMonth) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesItem = s.items.some((it) => it.productName.toLowerCase().includes(term));
        const matchesId = s.id.toLowerCase().includes(term);
        const matchesPay = s.paymentMode.toLowerCase().includes(term);
        return matchesItem || matchesId || matchesPay;
      }

      return true;
    });
  }, [sales, filter, searchTerm]);

  // Aggregate totals for the active filter
  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  }, [filteredSales]);

  const totalProfit = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.profit, 0);
  }, [filteredSales]);

  const totalCash = useMemo(() => {
    return filteredSales
      .filter((s) => s.paymentMode === "CASH")
      .reduce((acc, s) => acc + s.totalAmount, 0);
  }, [filteredSales]);

  const totalOnline = useMemo(() => {
    return filteredSales
      .filter((s) => s.paymentMode === "ONLINE")
      .reduce((acc, s) => acc + s.totalAmount, 0);
  }, [filteredSales]);

  const toggleExpand = (id: string) => {
    setExpandedSaleId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
          <Receipt className="w-5 h-5 text-[#0f766e]" />
          <span>Sales &amp; Transaction History</span>
        </h2>
        <p className="text-xs text-slate-500">Record of all counter bills &amp; payments</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 text-xs">
        <button
          onClick={() => setFilter("today")}
          className={`px-3 py-1.5 rounded-full font-medium transition-all ${filter === "today"
              ? "bg-[#0f766e] text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
        >
          Today
        </button>
        <button
          onClick={() => setFilter("week")}
          className={`px-3 py-1.5 rounded-full font-medium transition-all ${filter === "week"
              ? "bg-[#0f766e] text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
        >
          This Week
        </button>
        <button
          onClick={() => setFilter("month")}
          className={`px-3 py-1.5 rounded-full font-medium transition-all ${filter === "month"
              ? "bg-[#0f766e] text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
        >
          This Month
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full font-medium transition-all ${filter === "all"
              ? "bg-[#0f766e] text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
        >
          All
        </button>
      </div>

      {/* Aggregate Banner for Filter */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Total Sales ({filteredSales.length})
          </span>
          <span className="text-lg font-extrabold text-slate-900 block mt-0.5">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </span>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
            <span>Cash: ₹{totalCash}</span>
            <span>•</span>
            <span>Online: ₹{totalOnline}</span>
          </div>
        </div>

        <div className="border-l border-slate-100 pl-3">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Net Profit
          </span>
          <span className="text-lg font-extrabold text-emerald-600 block mt-0.5">
            +₹{totalProfit.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            After discounts &amp; CP
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f766e]"
        />
      </div>

      {/* Sales Transactions List */}
      <div className="space-y-2.5">
        {filteredSales.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Is filter me koi sales record nahi mila.
          </div>
        ) : (
          filteredSales.map((sale) => {
            const isExpanded = expandedSaleId === sale.id;
            const saleDate = new Date(sale.createdAt);

            return (
              <div
                key={sale.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs transition-all hover:border-slate-300"
              >
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(sale.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${sale.paymentMode === "ONLINE"
                            ? "bg-teal-50 text-teal-800"
                            : "bg-emerald-50 text-emerald-800"
                          }`}
                      >
                        {sale.paymentMode === "ONLINE" ? (
                          <CreditCard className="w-3 h-3" />
                        ) : (
                          <Banknote className="w-3 h-3" />
                        )}
                        <span>{sale.paymentMode}</span>
                      </span>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {saleDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                        ,{" "}
                        {saleDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-800 text-xs mt-1.5 line-clamp-1">
                      {sale.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                    </p>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">
                        ₹{sale.totalAmount}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 block">
                        +₹{sale.profit}
                      </span>
                    </div>

                    {/* Edit Quick Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSale(sale);
                      }}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-[#0f766e] text-slate-500 border border-slate-200 active:scale-90 transition-all ml-1"
                      title="Edit Sale / Bill"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""
                        }`}
                    />
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2 animate-in fade-in">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Itemized Breakdown:
                    </p>
                    <div className="bg-slate-50 p-2.5 rounded-xl space-y-1.5 border border-slate-100">
                      {sale.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-700">
                            {it.productName} × {it.quantity}
                          </span>
                          <span className="font-semibold text-slate-900">
                            ₹{it.unitSellingPrice * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Total Cost (CP): ₹{sale.totalCost}</span>
                      {sale.discount > 0 && (
                        <span className="text-amber-700 font-semibold">
                          Discount: ₹{sale.discount}
                        </span>
                      )}
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        Net Profit: ₹{sale.profit}
                      </span>
                    </div>

                    {sale.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/60">
                        Note: {sale.notes}
                      </p>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingSale(sale)}
                        className="px-3 py-1.5 rounded-xl bg-[#0f766e] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-[#115e59] active:scale-95 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Bill Details</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Sale Modal */}
      {editingSale && (
        <EditSaleModal
          sale={editingSale}
          isOpen={!!editingSale}
          onClose={() => setEditingSale(null)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
