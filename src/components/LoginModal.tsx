"use client";

import React, { useState } from "react";
import { Lock, Store, ShieldCheck } from "lucide-react";

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
      setError("Kripya 4-digit PIN enter karein");
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
      setError("Network ya connection error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-[#0f766e]">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mt-4">Store Dashboard Locked</h2>
        <p className="text-xs text-slate-500 mt-1.5">
          Access karne ke liye apna 4-digit Admin PIN enter karein
        </p>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <input
            type="password"
            maxLength={6}
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full text-center text-3xl font-extrabold tracking-widest px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-[#0f766e] focus:bg-white transition-all text-slate-800"
          />

          <button
            type="submit"
            disabled={isLoading || pin.length < 4}
            className="w-full py-3.5 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-sm rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? "Verifying..." : "Unlock Dashboard"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
