"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import BottomNav, { ActiveTab } from "@/components/BottomNav";
import DashboardView from "@/components/DashboardView";
import ProductsView from "@/components/ProductsView";
import SalesHistoryView from "@/components/SalesHistoryView";
import NewSaleModal from "@/components/NewSaleModal";
import LoginModal from "@/components/LoginModal";
import { ProductItem, SaleRecord } from "@/lib/storeService";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem("store_auth_unlocked");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      // By default open dashboard, can require pin if desired
      setIsAuthenticated(true); // default unlocked for instant friction-free access
    }
  }, []);

  // Fetch all store data
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, productsRes, salesRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/products"),
        fetch("/api/sales?filter=all"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (productsRes.ok) {
        const prodData = await productsRes.json();
        setProducts(prodData);
      }
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSales(salesData);
      }
    } catch (err) {
      console.error("Failed to load store data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Quick Stock increment / decrement
  const handleQuickStockChange = async (id: string, delta: number) => {
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
        )
      );

      await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "adjust_stock", delta }),
      });

      // Refresh stats
      fetchData();
    } catch (err) {
      console.error("Failed to adjust stock:", err);
      fetchData();
    }
  };

  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-start">
      {/* Mobile-sized app container */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#f8fafc] shadow-2xl flex flex-col relative border-x border-slate-200">
        {/* Header */}
        <Header
          storeName="Apna Store"
          isRefreshing={isRefreshing}
          onRefresh={fetchData}
          lowStockCount={lowStockCount}
          onOpenLowStock={() => setActiveTab("products")}
        />

        {/* Tab Content */}
        <main className="flex-1 overflow-x-hidden">
          {activeTab === "dashboard" && (
            <DashboardView
              stats={stats}
              onOpenNewSale={() => setIsNewSaleOpen(true)}
              onGoToProducts={() => setActiveTab("products")}
              onGoToSales={() => setActiveTab("sales")}
              onQuickRestock={(id, delta) => handleQuickStockChange(id, delta)}
            />
          )}

          {activeTab === "products" && (
            <ProductsView
              products={products}
              onRefresh={fetchData}
              onQuickStockChange={handleQuickStockChange}
            />
          )}

          {activeTab === "sales" && (
            <SalesHistoryView sales={sales} onRefresh={fetchData} />
          )}
        </main>

        {/* POS Sale Modal / Bottom Sheet */}
        <NewSaleModal
          isOpen={isNewSaleOpen}
          onClose={() => setIsNewSaleOpen(false)}
          products={products}
          onSaleSuccess={() => {
            fetchData();
            setActiveTab("dashboard");
          }}
        />

        {/* Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenNewSale={() => setIsNewSaleOpen(true)}
        />

        {/* Login Security Modal (if locked) */}
        {!isAuthenticated && (
          <LoginModal
            isOpen={!isAuthenticated}
            onSuccess={() => {
              sessionStorage.setItem("store_auth_unlocked", "true");
              setIsAuthenticated(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
