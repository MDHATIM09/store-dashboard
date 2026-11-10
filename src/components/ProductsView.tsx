"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  AlertTriangle,
  X,
  Check,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { ProductItem } from "@/lib/storeService";

interface ProductsViewProps {
  products: ProductItem[];
  onRefresh: () => void;
  onQuickStockChange: (id: string, delta: number) => void;
}

export default function ProductsView({
  products,
  onRefresh,
  onQuickStockChange,
}: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "low" | "out">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("3");
  const [category, setCategory] = useState("General");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName("");
    setCostPrice("");
    setSellingPrice("");
    setStock("");
    setLowStockThreshold("3");
    setCategory("General");
    setFormError("");
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setName(p.name);
    setCostPrice(p.costPrice.toString());
    setSellingPrice(p.sellingPrice.toString());
    setStock(p.stock.toString());
    setLowStockThreshold(p.lowStockThreshold.toString());
    setCategory(p.category || "General");
    setFormError("");
    setIsAddModalOpen(true);
  };

  // Submit product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Product ka naam likhna zaroori hai");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = {
        name: name.trim(),
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        stock: parseInt(stock) || 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 3,
        category: category.trim() || "General",
      };

      if (editingProduct) {
        // Edit
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Product update nahi ho paya");
      } else {
        // Add
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Product add nahi ho paya");
      }

      setIsAddModalOpen(false);
      onRefresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error saving product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`Kya aap "${prodName}" ko delete karna chahte hain?`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (filterType === "low") return p.stock <= p.lowStockThreshold && p.stock > 0;
      if (filterType === "out") return p.stock <= 0;
      return true;
    });
  }, [products, searchTerm, filterType]);

  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Package className="w-5 h-5 text-[#0f766e]" />
            <span>Product Inventory</span>
          </h2>
          <p className="text-xs text-slate-500">Total {products.length} items in stock</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#0f766e] hover:bg-[#115e59] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search & Filter pills */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f766e]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 rounded-full font-medium transition-all ${filterType === "all"
                ? "bg-[#0f766e] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilterType("low")}
            className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${filterType === "low"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Low Stock ({lowStockCount})</span>
          </button>
          <button
            onClick={() => setFilterType("out")}
            className={`px-3 py-1 rounded-full font-medium transition-all ${filterType === "out"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Product List Cards */}
      <div className="space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Koi product nahi mila. &quot;Add Product&quot; button se naya add karein!
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isLow = p.stock <= p.lowStockThreshold && p.stock > 0;
            const isOut = p.stock <= 0;
            const profitMargin =
              p.sellingPrice > 0
                ? Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100)
                : 0;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-3.5 border shadow-xs transition-all ${isOut
                    ? "border-rose-200 bg-rose-50/20"
                    : isLow
                      ? "border-amber-200 bg-amber-50/20"
                      : "border-slate-200"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                        {p.category}
                      </span>
                    </div>

                    {/* Pricing row */}
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Cost (CP)</span>
                        <span className="font-semibold text-slate-700">₹{p.costPrice}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Selling (SP)</span>
                        <span className="font-extrabold text-[#0f766e]">₹{p.sellingPrice}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <TrendingUp className="w-3 h-3" />
                        <span>{profitMargin}% margin</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit / Delete actions */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0f766e] hover:bg-teal-50 active:scale-95"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stock bar & Quick +/- buttons */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${isOut
                          ? "bg-rose-100 text-rose-800"
                          : isLow
                            ? "bg-amber-100 text-amber-900"
                            : "bg-teal-50 text-[#0f766e]"
                        }`}
                    >
                      {isLow && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      <span>
                        Stock: {p.stock} {p.stock === 1 ? "unit" : "units"}
                      </span>
                    </span>
                    {p.lowStockThreshold > 0 && (
                      <span className="text-[10px] text-slate-400">
                        (Alert at $\le$ {p.lowStockThreshold})
                      </span>
                    )}
                  </div>

                  {/* Quick stock stepper */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onQuickStockChange(p.id, -1)}
                      disabled={p.stock <= 0}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs active:scale-90 disabled:opacity-30"
                      title="-1 Stock"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => onQuickStockChange(p.id, 1)}
                      className="w-7 h-7 rounded-lg bg-teal-50 hover:bg-[#0f766e] hover:text-white text-[#0f766e] font-bold flex items-center justify-center text-xs active:scale-90"
                      title="+1 Stock"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => onQuickStockChange(p.id, 5)}
                      className="px-2 h-7 rounded-lg bg-[#0f766e] text-white font-bold flex items-center justify-center text-xs active:scale-90"
                      title="+5 Stock"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                <Package className="w-5 h-5 text-[#0f766e]" />
                <span>{editingProduct ? "Edit Product" : "Add New Product"}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3.5">
              {/* Product Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Tea Gold 500g"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f766e] focus:bg-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grocery, Snacks, Cleaning"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f766e] focus:bg-white"
                />
              </div>

              {/* CP & SP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Cost Price (CP) ₹ *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Khareed rate"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f766e] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Selling Price (SP) ₹ *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Bechne ka rate"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f766e] focus:bg-white font-bold text-[#0f766e]"
                  />
                </div>
              </div>

              {/* Stock & Low Stock Threshold */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Current Stock *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Kitne piece hain"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f766e] focus:bg-white font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Low Stock Alert Limit
                  </label>
                  <input
                    type="number"
                    placeholder="Default: 3"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f766e] focus:bg-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0f766e] hover:bg-[#115e59] text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSubmitting ? "Saving..." : "Save Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

