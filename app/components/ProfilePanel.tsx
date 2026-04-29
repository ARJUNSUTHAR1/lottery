"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { SafeUser, TicketBooking, UserSettings } from "@/lib/auth";

type ProfilePayload = {
  user: SafeUser;
  tickets: TicketBooking[];
};

type Props = {
  open: boolean;
  user: SafeUser | null;
  onClose: () => void;
  onUserUpdated: (user: SafeUser | null) => void;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong.");
  }

  return data;
}

export function ProfilePanel({ open, user, onClose, onUserUpdated }: Props) {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lastLoadedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    if (profile?.user?.id === user.id) return;
    if (lastLoadedUserIdRef.current === user.id) return;

    let cancelled = false;
    lastLoadedUserIdRef.current = user.id;
    setError("");
    Promise.resolve()
      .then(() => fetchJson<ProfilePayload>("/api/profile"))
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
      })
      .catch((caught) => {
        if (cancelled) return;
        setError(caught instanceof Error ? caught.message : "Unable to load profile.");
      })

    return () => {
      cancelled = true;
    };
  }, [open, user?.id, profile?.user?.id]);

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!profile) return;
    setSaving(true);
    setError("");

    try {
      const data = await fetchJson<ProfilePayload>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ settings }),
      });
      setProfile(data);
      onUserUpdated(data.user);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update settings.");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    setSaving(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setSaving(false);
    setProfile(null);
    onUserUpdated(null);
    onClose();
  };

  const activeUser = profile?.user ?? user;
  const loading = open && !!user && !profile && !error;

  return (
    <AnimatePresence>
      {open && activeUser ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <motion.aside
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="royal-panel flex h-full w-full max-w-md flex-col border-l border-amber-200/15 bg-[#14070f] p-5 shadow-2xl shadow-black/40 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">My Profile</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{activeUser.name}</h2>
                <p className="mt-1 text-sm text-zinc-400">{activeUser.email}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/25 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto pb-5">
              {loading ? <p className="mt-6 text-sm text-zinc-400">Loading profile...</p> : null}
              {error ? (
                <p className="mt-5 rounded-2xl border border-red-300/15 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                  {error}
                </p>
              ) : null}

              <section className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">User Settings</h3>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Control alerts and language for your lottery account.
                    </p>
                  </div>
                  {saving ? <span className="text-xs text-amber-200">Saving...</span> : null}
                </div>

                <div className="mt-4 space-y-3">
                  <SettingToggle
                    label="Booking alerts"
                    description="Get reminders for booked ticket draw timings."
                    checked={activeUser.settings.bookingAlerts}
                    onChange={(checked) => updateSettings({ bookingAlerts: checked })}
                  />
                  <SettingToggle
                    label="Marketing emails"
                    description="Receive offers, jackpot news, and reward updates."
                    checked={activeUser.settings.marketingEmails}
                    onChange={(checked) => updateSettings({ marketingEmails: checked })}
                  />
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                    <p className="text-sm font-semibold text-zinc-100">Preferred language</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {(["en", "hi"] as const).map((language) => (
                        <button
                          key={language}
                          type="button"
                          onClick={() => updateSettings({ language })}
                          className={`cursor-pointer rounded-full px-3 py-2 text-xs font-semibold transition ${
                            activeUser.settings.language === language
                              ? "bg-amber-300 text-[#2d1400]"
                              : "bg-white/8 text-zinc-300 hover:bg-white/12"
                          }`}
                        >
                          {language === "en" ? "English" : "Hindi"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">Ticket Booking History</h3>
                    <p className="mt-1 text-xs text-zinc-500">Recent tickets booked from this account.</p>
                  </div>
                  <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-zinc-300">
                    {profile?.tickets.length ?? 0}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {profile?.tickets.length ? (
                    profile.tickets.map((ticket) => (
                      <article
                        key={ticket.id}
                        className="rounded-2xl border border-amber-200/10 bg-[#120b0f] p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{ticket.drawName}</p>
                            <p className="mt-1 text-xs text-amber-200">{ticket.prize}</p>
                          </div>
                          <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-100">
                            {ticket.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                          <span className="rounded-full bg-white/6 px-2.5 py-1">{ticket.ticketNumber}</span>
                          <span className="rounded-full bg-white/6 px-2.5 py-1">{ticket.drawTime}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-6 text-center">
                      <p className="text-sm font-semibold text-zinc-200">No ticket bookings yet</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        Book a draw from the home page and it will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <button
              type="button"
              onClick={signOut}
              disabled={saving}
              className="mt-4 w-full cursor-pointer rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:border-white/30 disabled:opacity-60"
            >
              Sign Out
            </button>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
      <span>
        <span className="block text-sm font-semibold text-zinc-100">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-zinc-500">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-amber-300"
      />
    </label>
  );
}

