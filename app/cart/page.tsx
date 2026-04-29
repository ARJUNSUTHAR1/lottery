"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearCart,
  getCart,
  removeDraw,
  removeTickets,
  type CartState,
} from "./cartStorage";
import { Navbar } from "@/app/components/Navbar";
import type { SafeUser } from "@/lib/auth";

type CashfreeCheckoutResult = { error?: { message?: string }; redirect?: boolean };

declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => {
      checkout: (options: { paymentSessionId: string; returnUrl: string }) => Promise<CashfreeCheckoutResult>;
    };
  }
}

function formatMoney(amount: number) {
  return amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartState>(() => getCart());
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [user, setUser] = useState<SafeUser | null>(null);
  const [error, setError] = useState("");

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const sync = () => setCart(getCart());
    window.addEventListener("subhlaxmi_cart_updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("subhlaxmi_cart_updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const totals = useMemo(() => {
    const gstRate = 0.18;
    const subtotal = cart.items.reduce((sum, item) => sum + item.ticketNumbers.length * item.pricePerTicket, 0);
    const gst = Math.round(subtotal * gstRate * 100) / 100;
    const grandTotal = Math.round((subtotal + gst) * 100) / 100;
    const totalTickets = cart.items.reduce((sum, item) => sum + item.ticketNumbers.length, 0);
    return { subtotal, gst, grandTotal, totalTickets };
  }, [cart.items]);

  const startCheckout = async () => {
    setError("");
    if (!cart.items.length) return;
    if (!window.Cashfree) {
      setError("Payment SDK not loaded. Please refresh and try again.");
      return;
    }

    setLoadingCheckout(true);
    try {
      const res = await fetch("/api/payments/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });
      if (res.status === 401) {
        window.location.href = `/?auth=signin&next=${encodeURIComponent("/cart")}`;
        return;
      }
      const data = (await res.json()) as { payment_session_id?: string; order_id?: string; error?: string; mode?: "sandbox" | "production" };
      if (!res.ok || !data.payment_session_id || !data.order_id) {
        throw new Error(data.error ?? "Unable to create payment order.");
      }

      const mode: "sandbox" | "production" = data.mode ?? "sandbox";
      const cashfree = window.Cashfree({ mode });
      const returnUrl = `${window.location.origin}/payment/cashfree?order_id={order_id}`;
      const result = await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        returnUrl,
      });

      if (result?.error?.message) {
        setError(result.error.message);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Checkout failed.");
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="royal-surface royal-grid min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="afterInteractive" />
      
      <Navbar 
        user={user} 
        onAuthChange={(newUser) => {
          setUser(newUser);
          if (!newUser) router.push('/');
        }}
      />

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-200/70">Cart</p>
            <h1 className="mt-2 text-2xl font-semibold">Your selected tickets</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Review ticket numbers, then pay securely to confirm.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                clearCart();
                setCart(getCart());
              }}
              className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200 hover:border-white/25"
            >
              Clear cart
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-4">
            {cart.items.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-8 text-center">
                <p className="text-lg font-semibold text-zinc-100">Cart is empty</p>
                <p className="mt-2 text-sm text-zinc-500">Select ticket numbers from a draw and add them to cart.</p>
              </div>
            ) : (
              cart.items.map((item) => (
                <article
                  key={item.drawId}
                  className="rounded-3xl border border-white/10 bg-[#14070f] p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{item.drawName}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(item.drawDate).toLocaleDateString("en-IN")} • {item.drawTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-300/12 px-3 py-1 text-xs font-semibold text-amber-200">
                        {item.ticketNumbers.length} tickets
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDraw(item.drawId)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 hover:border-white/25"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {item.ticketNumbers.slice(0, 12).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => removeTickets(item.drawId, [num])}
                        className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-center font-mono text-xs font-semibold text-zinc-100 hover:border-red-300/40 hover:text-red-200"
                        title="Click to remove"
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {item.ticketNumbers.length > 12 ? (
                    <p className="mt-3 text-xs text-zinc-500">
                      +{item.ticketNumbers.length - 12} more selected
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                    <span>Price per ticket</span>
                    <span className="text-zinc-200">₹{item.pricePerTicket}</span>
                  </div>
                </article>
              ))
            )}
          </section>

          <aside className="rounded-3xl border border-white/10 bg-[#0f0a0c] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-300">Order summary</p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Tickets</span>
                <span className="text-zinc-200">{totals.totalTickets}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-200">₹{formatMoney(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>GST (18%)</span>
                <span className="text-zinc-200">₹{formatMoney(totals.gst)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold text-amber-300">
                <span>Total</span>
                <span>₹{formatMoney(totals.grandTotal)}</span>
              </div>
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-red-300/15 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!cart.items.length || loadingCheckout}
              onClick={startCheckout}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 py-3 text-sm font-bold text-[#2d1400] disabled:opacity-50"
            >
              {loadingCheckout ? "Opening payment…" : "Buy & Pay Securely"}
            </button>

            <p className="mt-3 text-[11px] leading-5 text-zinc-500">
              After payment, your ticket booking will appear in your profile history.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

