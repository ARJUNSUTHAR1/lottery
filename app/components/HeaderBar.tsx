"use client";

import Link from "next/link";
import { CartNavButton } from "./CartNavButton";
import { ThemeToggle } from "./ThemeToggle";
import type { SafeUser } from "@/lib/auth";

export type HeaderBarProps = {
  heroTitle: string;
  governmentSubtitle?: string;
  menu: string[];
  signIn: string;
  register: string;
  language: "en" | "hi";
  onLanguageChange: (lang: "en" | "hi") => void;
  authUser: SafeUser | null;
  onSignIn: () => void;
  onRegister: () => void;
  onProfileClick: () => void;
};

export function HeaderBar({
  heroTitle,
  governmentSubtitle = "Government Lottery",
  menu,
  signIn,
  register,
  language,
  onLanguageChange,
  authUser,
  onSignIn,
  onRegister,
  onProfileClick,
}: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-amber-500/20 bg-[#17060d]/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-12">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            aria-label="Subhlaxmi — go to home"
            className="sl-brand-lockup group flex flex-col leading-none rounded-sm outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0"
          >
            <p className="sl-brand-title text-lg font-semibold uppercase tracking-[0.18em] text-amber-300">
              {heroTitle}
            </p>
            <p className="sl-brand-subtitle mt-1 text-[10px] font-semibold uppercase text-zinc-300/80">
              {governmentSubtitle}
            </p>
          </Link>

          <nav className="hidden items-center gap-2 text-xs font-semibold text-zinc-200 lg:flex">
            {menu.map((item, index) => (
              <a
                key={item}
                href={index === 0 ? "/" : "#"}
                className={`rounded-full px-3 py-2 transition ${
                  index === 0 ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="rounded-full border border-white/15 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => onLanguageChange("en")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                language === "en" ? "bg-white text-zinc-900" : "sl-lang-inactive text-zinc-200"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("hi")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                language === "hi" ? "bg-white text-zinc-900" : "sl-lang-inactive text-zinc-200"
              }`}
            >
              हिं
            </button>
          </div>
          <CartNavButton />
          <ThemeToggle />
          {authUser ? (
            <button
              type="button"
              onClick={onProfileClick}
              className="sl-header-profile-btn flex items-center gap-2 rounded-full border border-amber-200/20 px-3 py-2 text-zinc-100 transition hover:border-amber-200/40"
            >
              <span className="sl-header-profile-avatar flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-amber-300 to-orange-500 text-xs font-bold text-[#2d1400]">
                {authUser.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-28 truncate text-xs font-semibold sm:inline">
                {authUser.name}
              </span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onSignIn}
                className="sl-header-signin rounded-full border border-white/15 px-4 py-2 text-zinc-100 transition hover:border-white/30"
              >
                {signIn}
              </button>
              <button
                type="button"
                onClick={onRegister}
                className="sl-cta-gradient rounded-full px-4 py-2 font-semibold text-white transition hover:scale-[1.03]"
              >
                {register}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
