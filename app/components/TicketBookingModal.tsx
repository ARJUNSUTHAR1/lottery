"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DrawPublic, SeriesStats, TicketPublic } from "@/lib/draws";
import type { SafeUser } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "available" | "lp_special" | "search";

type BookingResult = {
  booked: TicketPublic[];
  failed: string[];
  total: number;
};

type TicketPage = {
  tickets: TicketPublic[];
  total: number;
  hasMore: boolean;
  page: number;
  stats: SeriesStats;
  drawTotal: number;
  drawAvailable: number;
};

type Props = {
  draw: DrawPublic | null;
  user: SafeUser | null;
  open: boolean;
  onClose: () => void;
  onNeedAuth: () => void;
  onBooked: (result: BookingResult) => void;
};

// ─── Quick-pick amounts ───────────────────────────────────────────────────────

const QUICK_AMOUNTS = [1, 5, 10, 50, 100] as const;

// ─── Main component ───────────────────────────────────────────────────────────

export function TicketBookingModal({
  draw,
  user,
  open,
  onClose,
  onNeedAuth,
  onBooked,
}: Props) {
  const [activeSeries, setActiveSeries] = useState("A");
  const [activeTab, setActiveTab] = useState<Tab>("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [ticketData, setTicketData] = useState<TicketPage | null>(null);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<Map<string, TicketPublic>>(new Map());
  const [bookingState, setBookingState] = useState<"idle" | "booking" | "success" | "error">("idle");
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [bookingError, setBookingError] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  const gstRate = 0.18;
  const pricePerTicket = draw?.pricePerTicket ?? 0;
  const gstAmount = Math.round(pricePerTicket * gstRate * 100) / 100;
  const totalPerTicket = pricePerTicket + gstAmount;
  const selectedCount = selected.size;
  const grandTotal = Math.round(selectedCount * totalPerTicket * 100) / 100;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Initialize when modal opens (avoid sync setState in effects rule)
  const didInitRef = useRef<string | null>(null);
  if (open && draw && didInitRef.current !== draw.id) {
    didInitRef.current = draw.id;
    setActiveSeries(draw.series[0] ?? "A");
    setActiveTab("available");
    setSearchQuery("");
    setDebouncedSearch("");
    setPage(1);
    setSelected(new Map());
    setTicketData(null);
    setBookingState("idle");
    setBookingError("");
    setBookingResult(null);
  }

  // Fetch tickets
  const fetchTickets = useCallback(
    async (pageNum: number, append = false) => {
      if (!draw) return;

      const params = new URLSearchParams({
        series: activeSeries,
        tab: activeTab === "search" ? "all" : activeTab,
        page: String(pageNum),
        limit: "200",
      });
      if (debouncedSearch) params.set("q", debouncedSearch);

      if (!append) setLoadingTickets(true);
      else setLoadingMore(true);

      try {
        const res = await fetch(`/api/draws/${draw.id}/tickets?${params}`);
        if (!res.ok) return;
        const data = (await res.json()) as TicketPage;

        setTicketData((prev) =>
          append && prev
            ? {
                ...data,
                tickets: [...prev.tickets, ...data.tickets],
              }
            : data,
        );
        setPage(pageNum);
      } finally {
        setLoadingTickets(false);
        setLoadingMore(false);
      }
    },
    [draw, activeSeries, activeTab, debouncedSearch],
  );

  useEffect(() => {
    if (!open || !draw) return;
    Promise.resolve().then(() => fetchTickets(1));
  }, [open, draw?.id, activeSeries, activeTab, debouncedSearch, fetchTickets]);

  // Scroll to top when series/tab changes
  useEffect(() => {
    gridRef.current?.scrollTo({ top: 0 });
  }, [activeSeries, activeTab]);

  // ─── Ticket selection ────────────────────────────────────────────────────

  const toggleTicket = (ticket: TicketPublic) => {
    if (ticket.status === "sold") return;
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(ticket.number)) {
        next.delete(ticket.number);
      } else {
        if (next.size >= 100) return prev; // hard cap
        next.set(ticket.number, ticket);
      }
      return next;
    });
  };

  const clearSelection = () => setSelected(new Map());

  const quickPick = (amount: number) => {
    const available =
      ticketData?.tickets.filter((t) => t.status === "available" && !selected.has(t.number)) ?? [];
    const toAdd = available.slice(0, amount - selectedCount);

    if (!toAdd.length) return;

    setSelected((prev) => {
      const next = new Map(prev);
      for (const t of toAdd) {
        if (next.size >= 100) break;
        next.set(t.number, t);
      }
      return next;
    });
  };

  // ─── Booking ─────────────────────────────────────────────────────────────

  const handleBook = async () => {
    if (!user) {
      onNeedAuth();
      return;
    }
    if (!selectedCount) return;
    if (!draw) return;

    setBookingState("booking");
    setBookingError("");

    try {
      const res = await fetch(`/api/draws/${draw.id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketNumbers: [...selected.keys()] }),
      });
      const data = (await res.json()) as { result?: BookingResult; error?: string };

      if (!res.ok || !data.result) {
        throw new Error(data.error ?? "Booking failed.");
      }

      setBookingResult(data.result);
      setBookingState("success");
      setSelected(new Map());
      onBooked(data.result);
      // Refresh ticket grid
      fetchTickets(1);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed.");
      setBookingState("error");
    }
  };

  if (!draw) return null;

  const remaining = ticketData?.drawAvailable ?? 0;
  const totalTickets = ticketData?.drawTotal ?? 0;
  const pctLeft = totalTickets > 0 ? Math.max(0, Math.min(100, (remaining / totalTickets) * 100)) : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 42 }}
            className="absolute inset-x-0 bottom-0 top-0 flex flex-col bg-[#0d0809] md:top-4 md:left-4 md:right-4 md:rounded-[28px] md:top-[2vh]"
          >
            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-amber-200/10 bg-[#110b0d] px-4 py-3 sm:px-5 sm:py-4 md:rounded-t-[28px]">
              <div className="flex min-w-0 flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">
                  Subhlaxmi &bull; Select Ticket Number
                </span>
                <h2 className="mt-1 text-base font-bold text-white sm:text-lg">{draw.name}</h2>
                {totalTickets > 0 ? (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400">
                      <span>
                        Only <span className="text-amber-200">{remaining.toLocaleString("en-IN")}</span> tickets left
                      </span>
                      <span className="text-zinc-500">{totalTickets.toLocaleString("en-IN")} total</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500"
                        style={{ width: `${pctLeft}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end text-right text-xs text-zinc-300">
                  <span>
                    Draw Date:{" "}
                    <span className="text-white">
                      {new Date(draw.drawDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                  <span>
                    Draw Time:{" "}
                    <span className="text-white">{draw.drawTime}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-amber-300/40 bg-amber-300/10 px-3 py-2">
                  <span className="text-xs font-semibold text-amber-200">₹</span>
                  <span className="text-lg font-bold text-amber-300">{draw.pricePerTicket}</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-1 cursor-pointer rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/25 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── Tab bar ───────────────────────────────────────────────── */}
            <div className="shrink-0 border-b border-white/8 bg-[#0f0a0c]">
              <div className="flex overflow-x-auto px-4 text-xs font-bold uppercase tracking-[0.12em] sm:px-5">
                {(["available", "lp_special", "search"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab !== "search") setSearchQuery("");
                    }}
                    className={`relative shrink-0 cursor-pointer px-4 py-3 transition sm:px-5 ${
                      activeTab === tab
                        ? "text-amber-300"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tab === "available"
                      ? "Available"
                      : tab === "lp_special"
                        ? "LP Series"
                        : "Search Number"}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-300"
                      />
                    )}
                  </button>
                ))}
              </div>

              {activeTab === "search" && (
                <div className="px-4 pb-3 pt-1 sm:px-5">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ticket number e.g. 10025"
                    className="w-full rounded-2xl border border-amber-200/20 bg-black/30 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-300/50"
                    inputMode="numeric"
                  />
                </div>
              )}
            </div>

            {/* ── Body: grid + sidebar ─────────────────────────────────── */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* Grid area */}
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {/* Series selector + stats */}
                <div className="shrink-0 border-b border-white/8 bg-[#0f0a0c] px-4 py-3 sm:px-5">
                  {ticketData?.stats && (
                    <div className="mb-3 text-[10px] leading-relaxed text-zinc-400 sm:text-xs">
                      Series:{" "}
                      <span className="text-amber-200">{activeSeries}</span>
                      {" · "}Range:{" "}
                      <span className="text-zinc-200">
                        {draw.ticketPrefix}-{activeSeries}-{draw.ticketRangeStart} to{" "}
                        {draw.ticketPrefix}-{activeSeries}-{draw.ticketRangeEnd}
                      </span>
                      {" · "}Total:{" "}
                      <span className="text-zinc-200">
                        {ticketData.stats.total.toLocaleString("en-IN")}
                      </span>
                      {" · "}Available:{" "}
                      <span className="font-semibold text-emerald-300">
                        {ticketData.stats.available.toLocaleString("en-IN")}
                      </span>
                      {" · "}Sold:{" "}
                      <span className="font-semibold text-red-400">
                        {ticketData.stats.sold.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {draw.series.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setActiveSeries(s);
                          setPage(1);
                        }}
                        className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition ${
                          activeSeries === s
                            ? "border-amber-300 bg-amber-300/15 text-amber-200"
                            : "border-white/12 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
                        }`}
                      >
                        {s} Series
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="shrink-0 flex flex-wrap gap-3 px-4 py-2 sm:px-5 text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm border border-amber-200/30 bg-transparent" />
                    Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-amber-300" />
                    Selected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-zinc-700" />
                    Sold
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-cyan-400/30 border border-cyan-400/40" />
                    LP Special
                  </span>
                </div>

                {/* Ticket grid */}
                <div
                  ref={gridRef}
                  className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-4 sm:px-5"
                >
                  {loadingTickets ? (
                    <div className="flex h-40 items-center justify-center">
                      <TicketGridSkeleton />
                    </div>
                  ) : ticketData?.tickets.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center gap-2 text-zinc-500">
                      <p className="text-sm font-semibold">No tickets found</p>
                      <p className="text-xs">Try a different series or search term.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-1.5 pt-1 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {ticketData?.tickets.map((ticket) => (
                          <TicketButton
                            key={ticket.id}
                            ticket={ticket}
                            isSelected={selected.has(ticket.number)}
                            onToggle={toggleTicket}
                          />
                        ))}
                      </div>

                      {ticketData?.hasMore && (
                        <div className="mt-4 flex justify-center">
                          <button
                            type="button"
                            disabled={loadingMore}
                            onClick={() => fetchTickets(page + 1, true)}
                            className="cursor-pointer rounded-full border border-white/15 px-6 py-2.5 text-xs font-semibold text-zinc-200 transition hover:border-white/30 disabled:opacity-50"
                          >
                            {loadingMore ? "Loading…" : "Load more tickets"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Quick pick bar */}
                <div className="shrink-0 border-t border-white/8 bg-[#110b0d] px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Quick Pick:
                    </span>
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        disabled={selectedCount >= 100}
                        onClick={() => quickPick(amt)}
                        className="cursor-pointer rounded-lg border border-amber-200/20 bg-amber-300/8 px-3 py-1.5 text-xs font-bold text-amber-200 transition hover:border-amber-300/50 hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {amt}
                      </button>
                    ))}
                    <span className="ml-auto text-xs text-zinc-500">
                      Random Ticket
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Right panel (cart) ───────────────────────────────────── */}
              <aside className="hidden w-72 shrink-0 flex-col border-l border-white/8 bg-[#110b0d] lg:flex xl:w-80">
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-300">
                    Selected Tickets
                    <span className="ml-2 rounded-full bg-amber-300/15 px-2 py-0.5 text-amber-200">
                      {selectedCount}
                    </span>
                  </p>
                  {selectedCount > 0 && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-[10px] text-zinc-500 transition hover:text-zinc-300"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Selected list */}
                <div className="hide-scrollbar flex-1 overflow-y-auto px-4 py-3">
                  {selectedCount === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center text-zinc-600">
                      <span className="text-2xl">🎫</span>
                      <p className="text-xs font-semibold">No tickets selected yet</p>
                      <p className="text-[11px] leading-5">
                        Click a ticket number from the grid or use Quick Pick to auto-select.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {[...selected.values()].map((t) => (
                        <div
                          key={t.number}
                          className="flex items-center justify-between rounded-xl border border-amber-200/15 bg-amber-300/5 px-3 py-2"
                        >
                          <span className="font-mono text-xs font-semibold text-amber-200">
                            {t.number}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleTicket(t)}
                            className="text-zinc-600 transition hover:text-red-400"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price summary */}
                <div className="shrink-0 border-t border-white/8 p-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Tickets selected</span>
                      <span className="text-zinc-200">{selectedCount}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Price per ticket</span>
                      <span className="text-zinc-200">₹{pricePerTicket}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>GST (18%)</span>
                      <span className="text-zinc-200">
                        ₹{selectedCount > 0 ? (gstAmount * selectedCount).toFixed(2) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-amber-300">
                      <span>Total</span>
                      <span>₹{grandTotal > 0 ? grandTotal.toFixed(2) : 0}</span>
                    </div>
                  </div>

                  {bookingState === "error" && (
                    <p className="mt-3 rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                      {bookingError}
                    </p>
                  )}

                  {bookingState === "success" && bookingResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-3 py-3 text-[11px]"
                    >
                      <p className="font-bold text-emerald-300">
                        🎉 {bookingResult.booked.length} ticket
                        {bookingResult.booked.length !== 1 ? "s" : ""} booked!
                      </p>
                      {bookingResult.failed.length > 0 && (
                        <p className="mt-1 text-amber-200">
                          {bookingResult.failed.length} ticket
                          {bookingResult.failed.length !== 1 ? "s were" : " was"} already sold.
                        </p>
                      )}
                    </motion.div>
                  )}

                  <motion.button
                    type="button"
                    onClick={handleBook}
                    disabled={
                      !selectedCount ||
                      bookingState === "booking" ||
                      bookingState === "success"
                    }
                    whileHover={selectedCount > 0 ? { scale: 1.02 } : {}}
                    transition={{ duration: 0.14 }}
                    className="mt-4 w-full rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 py-3 text-sm font-bold text-[#2d1400] transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bookingState === "booking"
                      ? "Booking…"
                      : bookingState === "success"
                        ? "Booked ✓"
                        : !user
                          ? "Sign in to Book"
                          : selectedCount > 0
                            ? `Proceed to Pay — ₹${grandTotal.toFixed(2)}`
                            : "Select Tickets"}
                  </motion.button>
                </div>
              </aside>
            </div>

            {/* ── Mobile bottom bar ────────────────────────────────────── */}
            <AnimatePresence>
              {selectedCount > 0 && (
                <motion.div
                  initial={{ y: 80 }}
                  animate={{ y: 0 }}
                  exit={{ y: 80 }}
                  transition={{ type: "spring", stiffness: 400, damping: 40 }}
                  className="shrink-0 border-t border-white/10 bg-[#18080f] px-4 py-3 lg:hidden"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-zinc-400">
                        {selectedCount} ticket{selectedCount !== 1 ? "s" : ""} selected
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-amber-300">
                        Total: ₹{grandTotal.toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="rounded-full border border-white/12 px-3 py-2 text-xs text-zinc-400"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleBook}
                      disabled={bookingState === "booking"}
                      className="rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 px-5 py-2.5 text-sm font-bold text-[#2d1400] transition disabled:opacity-50"
                    >
                      {bookingState === "booking" ? "Booking…" : "Pay →"}
                    </button>
                  </div>
                  {bookingState === "error" && (
                    <p className="mt-2 text-[11px] text-red-300">{bookingError}</p>
                  )}
                  {bookingState === "success" && bookingResult && (
                    <p className="mt-2 text-[11px] text-emerald-300">
                      🎉 {bookingResult.booked.length} ticket
                      {bookingResult.booked.length !== 1 ? "s" : ""} booked successfully!
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Ticket button ─────────────────────────────────────────────────────────────

function TicketButton({
  ticket,
  isSelected,
  onToggle,
}: {
  ticket: TicketPublic;
  isSelected: boolean;
  onToggle: (t: TicketPublic) => void;
}) {
  const isSold = ticket.status === "sold";

  let base =
    "relative w-full rounded-lg border py-2.5 text-center font-mono text-[11px] font-semibold tracking-wide transition select-none sm:text-xs";

  if (isSold) {
    base += " border-zinc-700/30 bg-zinc-900/40 text-zinc-700 cursor-not-allowed line-through";
  } else if (isSelected) {
    base += " border-amber-300 bg-amber-300/20 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.2)]";
  } else if (ticket.category === "lp_special") {
    base += " border-cyan-400/30 bg-cyan-900/20 text-cyan-200 hover:border-cyan-300/60 hover:bg-cyan-300/10 cursor-pointer";
  } else if (ticket.category === "special") {
    base += " border-purple-400/30 bg-purple-900/20 text-purple-200 hover:border-purple-300/60 hover:bg-purple-300/10 cursor-pointer";
  } else {
    base += " border-amber-200/20 bg-[#1a0e14] text-zinc-200 hover:border-amber-300/50 hover:bg-amber-300/5 hover:text-amber-100 cursor-pointer";
  }

  return (
    <motion.button
      type="button"
      className={base}
      onClick={() => onToggle(ticket)}
      whileTap={!isSold ? { scale: 0.94 } : {}}
      transition={{ duration: 0.08 }}
    >
      <span className="hidden sm:inline">{ticket.number}</span>
      <span className="sm:hidden">{ticket.number.replace(/^SL-[A-Z]-/, "")}</span>
      {ticket.category === "lp_special" && (
        <span className="absolute right-0.5 top-0.5 rounded-sm bg-cyan-400/30 px-0.5 text-[8px] text-cyan-300">
          LP
        </span>
      )}
      {ticket.category === "special" && (
        <span className="absolute right-0.5 top-0.5 rounded-sm bg-purple-400/30 px-0.5 text-[8px] text-purple-300">
          SP
        </span>
      )}
    </motion.button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TicketGridSkeleton() {
  return (
    <div className="grid w-full grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="h-9 animate-pulse rounded-lg border border-white/6 bg-white/4"
        />
      ))}
    </div>
  );
}
