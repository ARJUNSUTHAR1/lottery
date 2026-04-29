"use client";
import { useState } from "react";
import { CartNavButton } from "./CartNavButton";
import { ThemeToggle } from "./ThemeToggle";
import { ProfilePanel } from "./ProfilePanel";
import { AuthModal } from "./AuthModal";
import type { SafeUser } from "@/lib/auth";

interface NavbarProps {
  user?: SafeUser | null;
  onAuthChange?: (user: SafeUser | null) => void;
}

export function Navbar({ user, onAuthChange }: NavbarProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [showProfile, setShowProfile] = useState(false);

  const handleAuthSuccess = (newUser: SafeUser) => {
    setShowAuth(false);
    onAuthChange?.(newUser);
  };

  const handleSignOut = () => {
    setShowProfile(false);
    onAuthChange?.(null);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--background)]/80 border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 p-1">
              <div className="h-full w-full rounded bg-[var(--background)] flex items-center justify-center">
                <span className="text-xs font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                  SL
                </span>
              </div>
            </div>
            <span className="text-lg font-semibold text-[var(--foreground)]">SubhLaxmi</span>
          </div>
          
          <div className="flex items-center gap-3">
            <CartNavButton />
            <ThemeToggle />
            
            {user ? (
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 text-sm font-semibold text-[#2d1400] shadow-lg transition hover:shadow-xl"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setShowAuth(true);
                }}
                className="rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 px-4 py-2 text-sm font-semibold text-[#2d1400] shadow-lg transition hover:shadow-xl"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {showProfile && user && (
        <ProfilePanel
          open={showProfile}
          user={user}
          onClose={() => setShowProfile(false)}
          onUserUpdated={handleSignOut}
        />
      )}

      {showAuth && (
        <AuthModal
          open={showAuth}
          initialMode={authMode}
          onClose={() => setShowAuth(false)}
          onAuthed={handleAuthSuccess}
        />
      )}
    </>
  );
}