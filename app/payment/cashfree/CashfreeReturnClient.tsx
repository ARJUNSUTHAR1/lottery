"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clearCart } from "@/app/cart/cartStorage";
import { Navbar } from "@/app/components/Navbar";
import type { SafeUser } from "@/lib/auth";

export function CashfreeReturnClient() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("order_id") ?? "";
  const [state, setState] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("Verifying your payment…");
  const [user, setUser] = useState<SafeUser | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    void fetch("/api/payments/cashfree/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then(async (r) => ({ ok: r.ok, data: (await r.json()) as { ok?: boolean; error?: string } }))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok || !data.ok) {
          setState("failed");
          setMessage(data.error ?? "Payment verification failed.");
          return;
        }
        clearCart();
        setState("success");
        setMessage("Payment confirmed. Tickets booked successfully!");
        window.setTimeout(() => router.push("/"), 1200);
      })
      .catch(() => {
        if (cancelled) return;
        setState("failed");
        setMessage("Unable to verify payment. Please try again from cart.");
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  return (
    <div className="royal-surface royal-grid min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar 
        user={user} 
        onAuthChange={setUser}
      />
      
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/30 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-200/70">Cashfree</p>
        <h1 className="mt-2 text-2xl font-semibold">
          {!orderId ? "Payment issue" : state === "verifying" ? "Confirming payment" : state === "success" ? "Success" : "Payment issue"}
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          {!orderId ? "Missing order id. Please return to cart and try again." : message}
        </p>

        {!orderId || state === "failed" ? (
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="mt-5 w-full rounded-full sl-cta-gradient py-3 text-sm font-bold sl-force-light-text"
          >
            Back to Cart
          </button>
        ) : null}
      </div>
      </div>
    </div>
  );
}

