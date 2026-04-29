import { Suspense } from "react";
import { CashfreeReturnClient } from "./CashfreeReturnClient";

export const dynamic = "force-dynamic";

export default function CashfreeReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="royal-surface royal-grid flex min-h-screen items-center justify-center bg-[#12040c] px-4 text-white">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/30 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-200/70">Cashfree</p>
            <h1 className="mt-2 text-2xl font-semibold">Confirming payment</h1>
            <p className="mt-3 text-sm text-zinc-400">Loading…</p>
          </div>
        </div>
      }
    >
      <CashfreeReturnClient />
    </Suspense>
  );
}

