"use client";

import React, { useState } from "react";
import { Lock, Store, ShieldCheck, Check } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export default function LoginModal({ isOpen, onSuccess }: LoginModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
      } else {
        setError(data.error || "Galat PIN! Dubara koshish karein.");
      }
    } catch {
      setError("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-[#0f766e]">
          <Store className="w-7 h-7" />
        </div>

        <h2 className="text-lg font-bold text-slate-900 mt-3">Store Dashboard Login</h2>
        <p className="text-xs text-slate-500 mt-1">
          Admin access PIN enter karein (Default: <span className="font-bold text-[#0f766e]">1234</span>)
        </p>

        {error && (
          <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-5 space-y-4">
          <input
            type="password"
            maxLength={6}
            autoFocus
            placeholder="Enter PIN (e.g. 1234)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full text-center text-xl font-bold tracking-widest px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-[#0f766e] focus:bg-white"
          />

          <button
            type="submit"
            disabled={isLoading || pin.length < 4}
            className="w-full py-3 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-sm rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? "Verifying..." : "Unlock Dashboard"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

