"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Edit3,
  CreditCard,
  Banknote,
  Trash2,
  Save,
  AlertTriangle,
  Plus,
  Minus,
  TrendingUp,
} from "lucide-react";
import { SaleRecord, SaleRecordItem } from "@/lib/storeService";

interface EditSaleModalProps {
  sale: SaleRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSaleModal({
  sale,
  isOpen,
  onClose,
  onSuccess,
}: EditSaleModalProps) {
  const [paymentMode, setPaymentMode] = useState<"CASH" | "ONLINE">("CASH");
  const [items, setItems] = useState<SaleRecordItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  // Sync state when sale changes
  useEffect(() => {
    if (sale) {
      setPaymentMode(sale.paymentMode);
      setItems(sale.items.map((it) => ({ ...it })));
      setTotalAmount(sale.totalAmount);
      setDiscount(sale.discount || 0);
      setNotes(sale.notes || "");
      setConfirmDelete(false);
      setError("");
    }
  }, [sale]);

  if (!isOpen || !sale) return null;

  // Calculate gross total
  const grossTotal = items.reduce((acc, it) => acc + it.unitSellingPrice * it.quantity, 0);
  const totalCost = items.reduce((acc, it) => acc + it.unitCostPrice * it.quantity, 0);
  const estimatedProfit = totalAmount - totalCost;

  // Update item quantity
  const handleQuantityChange = (index: number, delta: number) => {
    setItems((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        // remove item
        updated.splice(index, 1);
      } else {
        updated[index].quantity = newQty;
        updated[index].subtotal = updated[index].unitSellingPrice * newQty;
      }

      // Automatically recalculate total amount
      const newGross = updated.reduce(
        (acc, it) => acc + it.unitSellingPrice * it.quantity,
        0
      );
      setTotalAmount(Math.max(0, newGross - discount));
      return updated;
    });
  };

  // Handle discount change
  const handleDiscountChange = (newDiscount: number) => {
    setDiscount(newDiscount);
    setTotalAmount(Math.max(0, grossTotal - newDiscount));
  };

  // Submit edit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Bill me kam se kam ek product hona chahiye!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/sales/${sale.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMode,
          items,
          totalAmount: Number(totalAmount),
          discount: Number(discount),
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update fail ho gaya");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update sale");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/sales/${sale.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete fail ho gaya");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete sale");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#0f766e]">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Edit Sale Record</h3>
              <p className="text-[10px] text-slate-400">
                ID: {sale.id.slice(-8)} • {new Date(sale.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Mode Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Payment Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode("CASH")}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  paymentMode === "CASH"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash Bill</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode("ONLINE")}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  paymentMode === "ONLINE"
                    ? "bg-teal-50 border-teal-500 text-teal-800 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Online / UPI</span>
              </button>
            </div>
          </div>

          {/* Items List */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">Products in Bill</label>
              <span className="text-[10px] text-slate-400">Stock automatically adjusts</span>
            </div>

            <div className="space-y-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              {items.length === 0 ? (
                <p className="text-slate-400 text-center py-2">Koi item nahi bacha.</p>
              ) : (
                items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-2xs"
                  >
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-slate-800 text-[11px] truncate">
                        {it.productName}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        ₹{it.unitSellingPrice} × {it.quantity} ={" "}
                        <span className="font-semibold text-slate-900">
                          ₹{it.unitSellingPrice * it.quantity}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(idx, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 font-bold"
                        title={it.quantity === 1 ? "Remove Item" : "Reduce Quantity"}
                      >
                        {it.quantity === 1 ? (
                          <Trash2 className="w-3 h-3 text-rose-500" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </button>

                      <span className="w-6 text-center font-bold text-slate-800 text-xs">
                        {it.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleQuantityChange(idx, 1)}
                        className="w-6 h-6 rounded-lg bg-[#0f766e]/10 hover:bg-[#0f766e]/20 active:scale-95 flex items-center justify-center text-[#0f766e] font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pricing Details */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Discount (₹)</label>
              <input
                type="number"
                min="0"
                value={discount || ""}
                onChange={(e) => handleDiscountChange(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#0f766e]"
                placeholder="0"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Final Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={totalAmount || ""}
                onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-[#0f766e] focus:outline-none focus:border-[#0f766e]"
                placeholder="0"
              />
            </div>
          </div>

          {/* Real-time Profit Preview */}
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-800 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Recalculated Profit:
            </span>
            <span className="font-extrabold text-emerald-700 text-xs">
              +₹{estimatedProfit}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Customer / Bill Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via PhonePe, change given"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f766e]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isLoading || isDeleting || items.length === 0}
              className="w-full py-3 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? "Saving changes..." : "Save Changes"}</span>
            </button>

            {/* Delete Sale Option */}
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full py-2 text-rose-600 hover:text-rose-700 font-medium text-[11px] flex items-center justify-center gap-1 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete this Bill (Restore Product Stock)</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-2">
                <p className="text-[11px] font-bold text-rose-800">
                  Kya aap sach me ye sale delete karna chahte hain?
                </p>
                <p className="text-[10px] text-rose-600">
                  Is bill ke sabhi products ka stock wapas increase ho jayega.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

