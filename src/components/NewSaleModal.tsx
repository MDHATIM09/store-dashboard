"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Banknote,
  CreditCard,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { ProductItem } from "@/lib/storeService";

interface CartItem {
  product: ProductItem;
  quantity: number;
}

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onSaleSuccess: () => void;
}

export default function NewSaleModal({
  isOpen,
  onClose,
  products,
  onSaleSuccess,
}: NewSaleModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "ONLINE">("CASH");
  const [customFinalAmount, setCustomFinalAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Filtered available products
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products.slice(0, 15);
    const term = searchTerm.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, searchTerm]);

  // Subtotal (Sum of SP * quantity)
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  }, [cart]);

  // Final Amount (either user edited, or subtotal)
  const finalAmount = useMemo(() => {
    if (customFinalAmount.trim() !== "") {
      const parsed = parseFloat(customFinalAmount);
      return isNaN(parsed) ? subtotal : parsed;
    }
    return subtotal;
  }, [customFinalAmount, subtotal]);

  // Discount
  const discount = Math.max(0, subtotal - finalAmount);

  const handleAddToCart = (product: ProductItem) => {
    if (product.stock <= 0) {
      setErrorMessage(`${product.name} out of stock hai!`);
      setTimeout(() => setErrorMessage(""), 2500);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          setErrorMessage(`Stock me sirf ${product.stock} pieces hain!`);
          setTimeout(() => setErrorMessage(""), 2500);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCustomFinalAmount(""); // Reset override when items change
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              setErrorMessage(`Stock me sirf ${item.product.stock} piece hain!`);
              setTimeout(() => setErrorMessage(""), 2500);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
    setCustomFinalAmount("");
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    setCustomFinalAmount("");
  };

  const handleSubmitSale = async () => {
    if (cart.length === 0) {
      setErrorMessage("Kam se kam 1 product select karein!");
      setTimeout(() => setErrorMessage(""), 2500);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitCostPrice: item.product.costPrice,
          unitSellingPrice: item.product.sellingPrice,
        })),
        totalAmount: finalAmount,
        discount: discount,
        paymentMode,
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Sale record karne me error aaya");
      }

      // Reset and close
      setCart([]);
      setCustomFinalAmount("");
      setSearchTerm("");
      onSaleSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error recording sale";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Modal Header */}
        <div className="bg-[#0f766e] text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-teal-200" />
            <h2 className="text-base font-bold">New Sale / Bill Entry</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body: Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Step 1: Search Products */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              1. Search &amp; Select Product
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Type product name (e.g. Tea, Oil, Soap)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f766e] focus:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Product selection chips/list */}
            <div className="mt-2 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
              {filteredProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-2 px-1">Koi product nahi mila</p>
              ) : (
                filteredProducts.map((p) => {
                  const inCart = cart.find((item) => item.product.id === p.id);
                  const isLow = p.stock <= p.lowStockThreshold;
                  const isOutOfStock = p.stock <= 0;

                  return (
                    <button
                      key={p.id}
                      onClick={() => handleAddToCart(p)}
                      disabled={isOutOfStock}
                      className={`text-left px-2.5 py-1.5 rounded-lg border text-xs transition-all active:scale-95 flex items-center gap-1.5 ${inCart
                          ? "bg-teal-50 border-[#0f766e] text-[#0f766e] font-semibold"
                          : isOutOfStock
                            ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                            : "bg-white border-slate-200 hover:border-[#0f766e] text-slate-700"
                        }`}
                    >
                      <span>{p.name}</span>
                      <span className="font-bold text-[#0f766e]">₹{p.sellingPrice}</span>
                      <span
                        className={`text-[9px] px-1 py-0.5 rounded ${isOutOfStock
                            ? "bg-rose-100 text-rose-700 font-bold"
                            : isLow
                              ? "bg-amber-100 text-amber-800 font-medium"
                              : "bg-slate-100 text-slate-500"
                          }`}
                      >
                        {isOutOfStock ? "Out" : `${p.stock} left`}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 2: Selected Items Cart */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                2. Items in Bill ({cart.length})
              </label>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                Upar se product tap karke add karein
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold text-slate-800 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-slate-500">
                        ₹{item.product.sellingPrice} × {item.quantity} ={" "}
                        <span className="font-bold text-[#0f766e]">
                          ₹{item.product.sellingPrice * item.quantity}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateQty(item.product.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.product.id, 1)}
                        className="w-7 h-7 rounded-lg bg-[#0f766e] text-white hover:bg-[#115e59] flex items-center justify-center font-bold active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center active:scale-90 ml-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Payment Mode */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
              3. Payment Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode("CASH")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${paymentMode === "CASH"
                    ? "bg-emerald-50 border-[#10b981] text-[#059669] shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode("ONLINE")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${paymentMode === "ONLINE"
                    ? "bg-teal-50 border-[#0f766e] text-[#0f766e] shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Online (UPI)</span>
              </button>
            </div>
          </div>

          {/* Step 4: Editable Final Price & Discount */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Subtotal (Total MRP):</span>
              <span className="font-bold text-slate-800">₹{subtotal}</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-800 block">
                  Final Selling Price (Editable):
                </label>
                <span className="text-[10px] text-slate-400">
                  Discount dia ho toh final rate yahan badal sakte hain
                </span>
              </div>
              <div className="w-28 relative">
                <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  placeholder={subtotal.toString()}
                  value={customFinalAmount}
                  onChange={(e) => setCustomFinalAmount(e.target.value)}
                  className="w-full pl-6 pr-2 py-1.5 text-sm font-extrabold text-[#0f766e] bg-white border border-slate-300 rounded-lg text-right focus:outline-none focus:border-[#0f766e]"
                />
              </div>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-xs text-amber-700 bg-amber-50 p-2 rounded-lg font-medium">
                <span>Total Discount Given:</span>
                <span className="font-bold">-₹{discount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer: Action Button */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Net Amount
            </span>
            <span className="text-xl font-extrabold text-slate-900">₹{finalAmount}</span>
          </div>

          <button
            onClick={handleSubmitSale}
            disabled={isSubmitting || cart.length === 0}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${isSubmitting || cart.length === 0
                ? "bg-slate-300 cursor-not-allowed shadow-none"
                : "bg-[#10b981] hover:bg-[#059669] shadow-emerald-500/20"
              }`}
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? "Recording..." : "Complete Sale"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

