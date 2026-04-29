"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "./components/AuthModal";
import { ProfilePanel } from "./components/ProfilePanel";
import { TicketBookingModal } from "./components/TicketBookingModal";
import { CartNavButton } from "./components/CartNavButton";
import { ThemeToggle } from "./components/ThemeToggle";
import { getCart, mergeCarts, setCart } from "@/app/cart/cartStorage";
import type { SafeUser } from "@/lib/auth";
import type { DrawSummaryPublic } from "@/lib/draws";

type Language = "en" | "hi";

type Stat = {
  label: string;
  value: number;
  suffix: string;
};

type Ticket = {
  name: string;
  prize: string;
  time: string;
};

type Category = {
  title: string;
  subtitle: string;
};

type ResultRow = {
  name: string;
  result: string;
};

type Testimonial = {
  name: string;
  location: string;
  quote: string;
  tag: string;
};

type CopyPack = {
  navItems: string[];
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  primaryCta: string;
  secondaryCta: string;
  signIn: string;
  register: string;
  popularTitle: string;
  categoriesTitle: string;
  liveResultsTitle: string;
  countdownTitle: string;
  nextDrawAt: string;
  footerTitle: string;
  footerDescription: string;
  footerButton: string;
  buyTicket: string;
  testimonialTitle: string;
  testimonialLabel: string;
  testimonialHelper: string;
  statsTitle: string;
  testimonials: Testimonial[];
  hrs: string;
  mins: string;
  secs: string;
  menu: string[];
  stats: Stat[];
  tickets: Ticket[];
  categories: Category[];
  resultRows: ResultRow[];
};

const copy: Record<Language, CopyPack> = {
  en: {
    navItems: ["Home", "Jackpots", "Results", "Rewards"],
    badge: "",
    heroTitle: "Subhlaxmi",
    heroSubtitle: "Kuber Ka Khajana. Dhan Varsha. Clean digital lottery experience.",
    heroDescription:
      "Book lottery tickets, check live draw timings, and explore premium jackpot games in one clean and easy experience.",
    primaryCta: "Play Now",
    secondaryCta: "Check Live Results",
    signIn: "Sign In",
    register: "Register",
    popularTitle: "Popular Draws Today",
    categoriesTitle: "Explore Categories",
    liveResultsTitle: "Live Result Board",
    countdownTitle: "Next Mega Draw",
    nextDrawAt: "Next draw at",
    footerTitle: "Fast UPI checkout and live lottery results",
    footerDescription: "",
    footerButton: "Create Account",
    buyTicket: "Buy Ticket",
    testimonialTitle: "Real wins, real stories",
    testimonialLabel: "Trusted players",
    testimonialHelper: "Fresh stories from verified ticket buyers across India.",
    statsTitle: "Platform pulse",
    testimonials: [
      {
        name: "Priya",
        location: "Kochi",
        quote:
          "Booking was smooth and the draw timing felt clear. I love how the winner artwork builds trust before I tap buy.",
        tag: "Verified",
      },
      {
        name: "Rahul",
        location: "Lucknow",
        quote:
          "The layout feels calm and readable. Small fonts on mobile still look crisp, and the countdown keeps me excited.",
        tag: "5★ rated",
      },
      {
        name: "Sneha",
        location: "Surat",
        quote:
          "The testimonial section feels festive without being loud. It is the kind of polish I expect from a premium app.",
        tag: "Happy buyer",
      },
    ],
    hrs: "Hrs",
    mins: "Min",
    secs: "Sec",
    menu: ["Home", "My Tickets", "Live Results", "Jackpots", "Rewards", "Support"],
    stats: [
      { label: "Active Players", value: 128000, suffix: "+" },
      { label: "Crorepati Winners", value: 4486, suffix: "+" },
      { label: "Tickets Today", value: 326000, suffix: "+" },
    ],
    tickets: [
      { name: "Kuber Ratna", prize: "INR 25 Cr", time: "Tonight 9:00 PM" },
      { name: "Shri Samridhi", prize: "INR 12 Cr", time: "Today 7:30 PM" },
      { name: "Riddhi Siddhi", prize: "INR 8 Cr", time: "Today 8:15 PM" },
      { name: "Dhan Laxmi Special", prize: "INR 5 Cr", time: "Tomorrow 1:00 PM" },
      { name: "Jai Mata Di Draw", prize: "INR 1.2 Cr", time: "Tomorrow 4:30 PM" },
      { name: "Vaibhav Laxmi", prize: "INR 2.75 Cr", time: "Friday 8:45 PM" },
      { name: "Sone Ki Baarish", prize: "INR 4.5 Cr", time: "Sunday 9:30 PM" },
    ],
    categories: [
      { title: "Bumper Draws", subtitle: "High prize pools" },
      { title: "Daily Results", subtitle: "Fast updates" },
      { title: "Quick Pick", subtitle: "Smart numbers" },
      { title: "Lucky Bundles", subtitle: "Combo tickets" },
      { title: "Refer & Earn", subtitle: "Bonus rewards" },
    ],
    resultRows: [
      { name: "Kuber Ratna", result: "49L 27278" },
      { name: "Shri Samridhi", result: "15K 10342" },
      { name: "Riddhi Siddhi", result: "07M 44129" },
      { name: "Dhan Laxmi Special", result: "82R 55104" },
    ],
  },
  hi: {
    navItems: ["होम", "जैकपॉट", "रिजल्ट", "रिवॉर्ड्स"],
    badge: "",
    heroTitle: "Subhlaxmi",
    heroSubtitle: "कुबेर का खजाना। धन वर्षा। साफ और आधुनिक डिजिटल लॉटरी अनुभव।",
    heroDescription:
      "एक ही जगह पर लॉटरी टिकट बुक करें, लाइव ड्रॉ टाइमिंग देखें और प्रीमियम जैकपॉट गेम्स एक्सप्लोर करें।",
    primaryCta: "अभी खेलें",
    secondaryCta: "लाइव रिजल्ट देखें",
    signIn: "साइन इन",
    register: "रजिस्टर",
    popularTitle: "आज के लोकप्रिय ड्रॉ",
    categoriesTitle: "कैटेगरी एक्सप्लोर करें",
    liveResultsTitle: "लाइव रिजल्ट बोर्ड",
    countdownTitle: "अगला मेगा ड्रॉ",
    nextDrawAt: "अगला ड्रॉ",
    footerTitle: "तेज UPI चेकआउट और लाइव लॉटरी रिजल्ट",
    footerDescription:
      "UPI से सेकंड्स में पेमेंट करें और ड्रॉ, टिकट, रिजल्ट सब एक ही जगह साफ़ तरीके से देखें।",
    footerButton: "अकाउंट बनाएं",
    buyTicket: "टिकट खरीदें",
    testimonialTitle: "असली जीत, असली कहानियां",
    testimonialLabel: "भरोसेमंद खिलाड़ी",
    testimonialHelper: "भारत भर के वेरिफाइड खरीदारों की ताज़ा प्रतिक्रियाएं।",
    statsTitle: "लाइव आंकड़े",
    testimonials: [
      {
        name: "प्रिया",
        location: "कोच्चि",
        quote:
          "बुकिंग आसान थी और ड्रॉ टाइम साफ दिखा। विनर आर्ट देखकर भरोसा बनता है।",
        tag: "वेरिफाइड",
      },
      {
        name: "राहुल",
        location: "लखनऊ",
        quote:
          "लेआउट शांत और पढ़ने में आसान है। मोबाइल पर छोटे फॉन्ट भी साफ दिखते हैं।",
        tag: "5★",
      },
      {
        name: "स्नेहा",
        location: "सूरत",
        quote:
          "टेस्टिमोनियल सेक्शन उत्सव जैसा लगता है। ज़्यादा शोर के बिना प्रीमियम फील।",
        tag: "खुश खरीदार",
      },
    ],
    hrs: "घंटे",
    mins: "मिनट",
    secs: "सेकंड",
    menu: ["होम", "मेरे टिकट", "लाइव रिजल्ट", "जैकपॉट", "रिवॉर्ड्स", "सपोर्ट"],
    stats: [
      { label: "सक्रिय खिलाड़ी", value: 128000, suffix: "+" },
      { label: "करोड़पति विजेता", value: 4486, suffix: "+" },
      { label: "आज के टिकट", value: 326000, suffix: "+" },
    ],
    tickets: [
      { name: "कुबेर रत्न", prize: "INR 25 Cr", time: "आज रात 9:00 बजे" },
      { name: "श्री समृद्धि", prize: "INR 12 Cr", time: "आज 7:30 बजे" },
      { name: "रिद्धि सिद्धि", prize: "INR 8 Cr", time: "आज 8:15 बजे" },
      { name: "धन लक्ष्मी स्पेशल", prize: "INR 5 Cr", time: "कल 1:00 बजे" },
      { name: "जय माता दी ड्रॉ", prize: "INR 1.2 Cr", time: "कल 4:30 बजे" },
      { name: "वैभव लक्ष्मी", prize: "INR 2.75 Cr", time: "शुक्रवार 8:45 बजे" },
      { name: "सोने की बारिश", prize: "INR 4.5 Cr", time: "रविवार 9:30 बजे" },
    ],
    categories: [
      { title: "बंपर ड्रॉ", subtitle: "बड़े प्राइज पूल" },
      { title: "डेली रिजल्ट", subtitle: "तेज अपडेट" },
      { title: "क्विक पिक", subtitle: "स्मार्ट नंबर" },
      { title: "लकी बंडल", subtitle: "कॉम्बो टिकट" },
      { title: "रेफर एंड अर्न", subtitle: "बोनस रिवॉर्ड" },
    ],
    resultRows: [
      { name: "कुबेर रत्न", result: "49L 27278" },
      { name: "श्री समृद्धि", result: "15K 10342" },
      { name: "रिद्धि सिद्धि", result: "07M 44129" },
      { name: "धन लक्ष्मी स्पेशल", result: "82R 55104" },
    ],
  },
};

const sliderImages = [
  "/slider1.png",
  "/slider2.png",
  "/slider3.png",
  "/slider4.png",
  "/slider5.png",
  "/slider7.png",
  "/slider8.png",
  "/slider9.png",
  "/slider10.png",
] as const;

const winners = [
  { image: "devendra j bansal.jpeg", amount: "₹1 Lakh" },
  { image: "nazir j balsara.jpeg", amount: "₹1 Lakh" },
  { image: "magnesh y pawar.jpeg", amount: "₹5 Lakhs" },
  { image: "krushmi y vira.jpeg", amount: "₹1 Lakh" },
  { image: "vikash vishwakarma.jpeg", amount: "₹2 Lakhs" },
] as const;

function formatWinnerName(fileName: string): string {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  return baseName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function WinnerCard({
  imageName,
  amount,
  gradientClass,
  burstKey,
  onBurst,
}: {
  imageName: string;
  amount: string;
  gradientClass: string;
  burstKey: number;
  onBurst: () => void;
}) {
  const winnerName = formatWinnerName(imageName);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || burstKey === 0) {
      const context = canvas?.getContext("2d");
      if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let cancelled = false;
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      const fire = confetti.create(canvas, { resize: true, useWorker: false });
      const colors = [
        "#fffbeb",
        "#fef3c7",
        "#fde68a",
        "#fcd34d",
        "#fbbf24",
        "#f59e0b",
        "#d97706",
        "#b45309",
      ];

      fire({
        particleCount: 32,
        spread: 42,
        startVelocity: 26,
        ticks: 90,
        gravity: 1.05,
        scalar: 0.6,
        origin: { x: 0.5, y: 0.35 },
        colors,
      });

      fire({
        particleCount: 18,
        spread: 70,
        startVelocity: 32,
        ticks: 110,
        gravity: 0.9,
        scalar: 0.45,
        origin: { x: 0.5, y: 0.3 },
        colors,
        shapes: ["circle"],
      });
    });

    return () => {
      cancelled = true;
    };
  }, [burstKey]);

  return (
    <motion.article whileHover={{ y: -6 }} transition={{ duration: 0.18 }} onPointerEnter={onBurst}>
      <div className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradientClass} p-[1px] shadow-lg shadow-black/35`}>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0a0c]/90 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
            aria-hidden
          />

          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-300/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
          </div>

          <div className="relative z-[4]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Winner
                </p>
                <p className="mt-1 text-base font-semibold text-white">{winnerName}</p>
              </div>
              <span className="inline-flex max-w-[46%] items-center justify-center rounded-full border border-amber-200/20 bg-amber-300/10 px-2.5 py-1 text-[11px] font-bold leading-none text-amber-200 sm:max-w-none sm:px-3 sm:text-xs whitespace-nowrap">
                Won {amount}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/15 bg-white/5 shadow-[0_0_0_6px_rgba(251,191,36,0.06)]">
                <Image
                  src={`/winner_image/${imageName}`}
                  alt={`${winnerName} winner image`}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-[11px]">
                🎉
              </span>
              <span className="font-semibold text-zinc-300">Congratulations!</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function VerticalImageCarousel({
  className,
  intervalMs = 1000,
}: {
  className?: string;
  intervalMs?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const restartKeyRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      timerRef.current = window.setTimeout(() => {
        setActiveIndex((i) => (i + 1) % sliderImages.length);
        tick();
      }, intervalMs);
    };

    tick();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [intervalMs]);

  const setActiveAndRestart = (index: number) => {
    setActiveIndex(index);
    restartKeyRef.current += 1;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setActiveIndex((i) => (i + 1) % sliderImages.length);
    }, intervalMs);
  };

  const src = sliderImages[activeIndex];

  return (
    <div className={["relative flex w-full flex-col", className ?? ""].join(" ")}>
      <div className="relative aspect-[1672/941] w-full overflow-hidden rounded-[22px] bg-black/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={src}
            initial={{ opacity: 0, y: 28, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -22, scale: 0.99 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={src}
              alt={`Slider image ${activeIndex + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1200px"
              className="object-contain object-center"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveAndRestart(index)}
            className={`h-2 cursor-pointer rounded-full transition ${
              index === activeIndex ? "w-7 bg-amber-300" : "w-2 bg-white/25 hover:bg-white/40"
            }`}
            aria-label={`Show slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function getNextDrawTime(baseDate: Date): Date {
  const drawHours = [13, 18, 21];
  const now = new Date(baseDate);

  for (const hour of drawHours) {
    const candidate = new Date(now);
    candidate.setHours(hour, 0, 0, 0);
    if (candidate.getTime() > now.getTime()) {
      return candidate;
    }
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(drawHours[0], 0, 0, 0);
  return tomorrow;
}

function formatDrawTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    weekday: "short",
  }).format(date);
}

function Counter({ label, value, suffix, compact }: Stat & { compact?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1400;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  if (compact) {
    return (
      <motion.article
        whileHover={{ y: -2, boxShadow: "0 0 18px rgba(251, 191, 36, 0.12)" }}
        className="rounded-xl border border-white/10 bg-[#1b0b1d]/95 px-3 py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
      >
        <p className="text-base font-bold tabular-nums leading-none text-amber-300 sm:text-lg">
          {displayValue.toLocaleString("en-IN")}
          {suffix}
        </p>
        <p className="mt-1 text-[10px] leading-snug text-zinc-400 sm:text-[11px]">{label}</p>
      </motion.article>
    );
  }

  return (
    <motion.article
      whileHover={{ y: -4, boxShadow: "0 0 28px rgba(251, 191, 36, 0.22)" }}
      className="rounded-2xl border border-white/10 bg-[#1b0b1d]/90 p-4 transition"
    >
      <p className="text-2xl font-bold text-amber-300">
        {displayValue.toLocaleString("en-IN")}
        {suffix}
      </p>
      <p className="mt-1 text-xs text-zinc-300/85">{label}</p>
    </motion.article>
  );
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-16 flex-col items-center rounded-xl border border-white/15 bg-black/30 px-3 py-2">
      <span className="text-xl font-bold text-amber-200">{value}</span>
      <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-200/80">
        {label}
      </span>
    </div>
  );
}

function RightInsightColumn({
  currentCopy,
  countdown,
  nextDraw,
}: {
  currentCopy: CopyPack;
  countdown: { hours: string; minutes: string; seconds: string };
  nextDraw: Date;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonialCanvasRef = useRef<HTMLCanvasElement>(null);
  const skipInitialConfetti = useRef(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % currentCopy.testimonials.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [currentCopy.testimonials.length]);

  useEffect(() => {
    if (skipInitialConfetti.current) {
      skipInitialConfetti.current = false;
      return;
    }
    const canvas = testimonialCanvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      const fire = confetti.create(canvas, { resize: true, useWorker: true });
      const colors = [
        "#fffbeb",
        "#fef3c7",
        "#fde68a",
        "#fcd34d",
        "#fbbf24",
        "#f59e0b",
        "#d97706",
        "#b45309",
      ];

      fire({
        particleCount: 52,
        spread: 56,
        startVelocity: 28,
        ticks: 100,
        gravity: 0.92,
        scalar: 0.85,
        origin: { x: 0.5, y: 0.48 },
        colors,
      });
      fire({
        particleCount: 32,
        spread: 118,
        startVelocity: 38,
        ticks: 125,
        gravity: 0.78,
        scalar: 0.52,
        origin: { x: 0.5, y: 0.4 },
        colors,
        shapes: ["circle"],
      });
    });

    return () => {
      cancelled = true;
    };
  }, [activeIndex]);

  const active = currentCopy.testimonials[activeIndex];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="royal-panel flex w-full min-w-0 flex-col gap-3 rounded-[24px] border border-white/10 bg-[#140912] p-4 sm:gap-3.5 sm:rounded-[28px] sm:p-4"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-amber-300/15 bg-[radial-gradient(circle_at_top,rgba(255,191,36,0.08),transparent_50%),#1a0f14]">
        <Image
          src="/goddesslaxmi.png"
          alt="Goddess Laxmi illustration"
          fill
          priority
          sizes="(max-width: 1279px) 100vw, 320px"
          className="object-contain p-3 sm:p-3.5"
        />
      </div>

      <div className="relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl border border-amber-300/12 bg-[#0c0812] px-3 py-3.5 sm:px-4 sm:py-4">
        <canvas
          ref={testimonialCanvasRef}
          className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
          aria-hidden
        />

        <div className="relative z-[5] flex flex-col gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-500 sm:text-[10px]">
              {currentCopy.testimonialLabel}
            </p>
            <h3 className="mt-1 text-sm font-semibold leading-snug text-white sm:text-base">
              {currentCopy.testimonialTitle}
            </h3>
            <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-500 sm:text-[11px]">
              {currentCopy.testimonialHelper}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.name}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col rounded-xl border border-white/8 bg-black/30 p-2.5 sm:p-3.5"
            >
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-[11px] font-bold text-[#301000] sm:h-9 sm:w-9 sm:text-xs">
                  {active.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-white sm:text-xs">{active.name}</p>
                  <p className="text-[10px] text-zinc-500 sm:text-[11px]">{active.location}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-zinc-200 sm:text-[10px]">
                  {active.tag}
                </span>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-zinc-300 sm:text-xs sm:leading-relaxed">
                &quot;{active.quote}&quot;
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-1.5 pt-0.5">
            {currentCopy.testimonials.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition sm:h-2 ${
                  index === activeIndex ? "w-5 bg-amber-300 sm:w-6" : "w-1.5 bg-white/25 hover:bg-white/40"
                }`}
                aria-label={`Show testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-500 sm:text-[10px]">
          {currentCopy.statsTitle}
        </p>
        <div className="flex flex-col gap-2">
          {currentCopy.stats.map((item) => (
            <Counter key={item.label} {...item} compact />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-300/10 bg-[#0f1626] px-3 py-3.5 sm:px-4 sm:py-4">
        <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-200/80 sm:text-xs">
          {currentCopy.countdownTitle}
        </p>
        <div className="mt-2 flex gap-1.5 sm:gap-2">
          <TimeBox value={countdown.hours} label={currentCopy.hrs} />
          <TimeBox value={countdown.minutes} label={currentCopy.mins} />
          <TimeBox value={countdown.seconds} label={currentCopy.secs} />
        </div>
        <p className="mt-2 text-[10px] text-zinc-400 sm:text-xs">
          {currentCopy.nextDrawAt} {formatDrawTime(nextDraw)}
        </p>
      </div>
    </motion.section>
  );
}

function FrameOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="royal-corner royal-corner-tl left-1 top-1 scale-[0.7] md:left-3 md:top-3 md:scale-100" />
      <div className="royal-corner royal-corner-tr right-1 top-1 scale-[0.7] md:right-3 md:top-3 md:scale-100" />
      <div className="royal-corner royal-corner-bl bottom-1 left-1 scale-[0.7] md:bottom-3 md:left-3 md:scale-100" />
      <div className="royal-corner royal-corner-br bottom-1 right-1 scale-[0.7] md:bottom-3 md:right-3 md:scale-100" />

      <div className="royal-knot left-2 top-2 scale-75 md:left-4 md:top-4 md:scale-100" />
      <div className="royal-knot right-2 top-2 scale-75 md:right-4 md:top-4 md:scale-100" />
      <div className="royal-knot bottom-2 left-2 scale-75 md:bottom-4 md:left-4 md:scale-100" />
      <div className="royal-knot bottom-2 right-2 scale-75 md:bottom-4 md:right-4 md:scale-100" />

      <div className="royal-knot left-1 top-1/2 hidden -translate-y-1/2 md:left-3 md:block" />
      <div className="royal-knot right-1 top-1/2 hidden -translate-y-1/2 md:right-3 md:block" />
    </div>
  );
}

function PanelCorners() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="royal-corner royal-corner-tl left-2 top-2 scale-75" />
      <div className="royal-corner royal-corner-tr right-2 top-2 scale-75" />
      <div className="royal-corner royal-corner-bl bottom-2 left-2 scale-75" />
      <div className="royal-corner royal-corner-br bottom-2 right-2 scale-75" />
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("en");
  const currentCopy = copy[language];
  const [nextDraw, setNextDraw] = useState<Date>(() => getNextDrawTime(new Date()));
  const [remainingTime, setRemainingTime] = useState(0);
  const [authUser, setAuthUser] = useState<SafeUser | null>(null);
  const [authOpen, setAuthOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    return auth === "signin" || auth === "register";
  });
  const [authMode, setAuthMode] = useState<"signin" | "register">(() => {
    if (typeof window === "undefined") return "signin";
    const params = new URLSearchParams(window.location.search);
    return params.get("auth") === "register" ? "register" : "signin";
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  // Live draws from DB
  const [liveDraws, setLiveDraws] = useState<DrawSummaryPublic[]>([]);
  // Ticket booking modal state
  const [ticketModalDraw, setTicketModalDraw] = useState<DrawSummaryPublic | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [winnerBurst, setWinnerBurst] = useState({ image: "", key: 0 });

  const openAuth = (mode: "signin" | "register") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const updateAuthedUser = useCallback((user: SafeUser | null) => {
    setAuthUser(user);
  }, []);

  // Restore session on page load
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { user: SafeUser };
      })
      .then((profile) => {
        if (!cancelled && profile?.user) setAuthUser(profile.user);
      })
      .catch(() => {
        if (!cancelled) setAuthUser(null);
      });
    return () => { cancelled = true; };
  }, []);

  // Load server cart after login and merge with local cart
  useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    void fetch("/api/cart", { cache: "no-store" })
      .then(async (r) => ({ ok: r.ok, data: (await r.json()) as { cart?: unknown } }))
      .then(({ ok, data }) => {
        if (cancelled || !ok || !data.cart) return;
        const remote = data.cart as ReturnType<typeof getCart>;
        const merged = mergeCarts(getCart(), remote);
        setCart(merged);
        void fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: merged }),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [authUser]);

  // Persist cart to DB on updates (when signed in)
  useEffect(() => {
    if (!authUser) return;
    let timer: number | null = null;
    const handler = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: getCart() }),
        });
      }, 300);
    };
    window.addEventListener("subhlaxmi_cart_updated", handler);
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("subhlaxmi_cart_updated", handler);
    };
  }, [authUser]);

  // Fetch live draws from DB, fall back to static data gracefully
  useEffect(() => {
    fetch("/api/draws")
      .then(async (r) => {
        if (!r.ok) return;
        const data = (await r.json()) as { draws: DrawSummaryPublic[] };
        if (data.draws.length) setLiveDraws(data.draws);
      })
      .catch(() => {});
  }, []);

  const openTicketModal = (draw: DrawSummaryPublic) => {
    setTicketModalDraw(draw);
    setTicketModalOpen(true);
  };

  // For static draw cards, find matching DB draw by name fragment
  const findLiveDraw = (staticName: string): DrawSummaryPublic | null => {
    const norm = staticName.toLowerCase();
    return (
      liveDraws.find((d) => d.name.toLowerCase().includes(norm.split(" ")[0])) ?? null
    );
  };

  const bookTicket = (ticket: Ticket) => {
    setBookingMessage("");
    const liveDraw = findLiveDraw(ticket.name);
    if (liveDraw) {
      openTicketModal(liveDraw);
    } else {
      // No DB draw yet – prompt auth or show info
      if (!authUser) {
        openAuth("signin");
      } else {
        setBookingMessage(
          `${ticket.name} is not yet available in the system. Run npm run seed to load draws.`,
        );
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let target = nextDraw;

      if (target.getTime() <= now.getTime()) {
        target = getNextDrawTime(now);
        setNextDraw(target);
      }

      setRemainingTime(Math.max(target.getTime() - now.getTime(), 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [nextDraw]);

  const countdown = useMemo(() => {
    const totalSeconds = Math.floor(remainingTime / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, "0");

    return { hours, minutes, seconds };
  }, [remainingTime]);

  return (
    <div className="royal-surface royal-grid royal-frame relative min-h-screen overflow-hidden bg-[#12040c] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-80 w-80 rounded-full bg-fuchsia-500/16 blur-3xl" />
        <div className="absolute right-[-10rem] top-[8rem] h-96 w-96 rounded-full bg-orange-500/16 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[20%] h-[26rem] w-[26rem] rounded-full bg-amber-300/12 blur-3xl" />
      </div>
      <FrameOverlay />

      <main className="relative h-screen overflow-hidden">
        <div className="flex h-full flex-col bg-[#17060d]/90 backdrop-blur-xl">
          <header className="sticky top-0 z-20 border-b border-amber-500/20 bg-[#17060d]/95 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-12">
              <div className="flex items-center gap-6">
                <div className="flex flex-col leading-none">
                  <p className="text-lg font-semibold uppercase tracking-[0.18em] text-amber-300">
                    {currentCopy.heroTitle}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase text-zinc-300/80">
                    Government Lottery
                  </p>
                </div>

                <nav className="hidden items-center gap-2 text-xs font-semibold text-zinc-200 lg:flex">
                  {currentCopy.menu.map((item, index) => (
                    <a
                      key={item}
                      href="#"
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
                    onClick={() => setLanguage("en")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      language === "en" ? "bg-white text-zinc-900" : "text-zinc-200"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage("hi")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      language === "hi" ? "bg-white text-zinc-900" : "text-zinc-200"
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
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/8 px-3 py-2 text-zinc-100 transition hover:border-amber-200/40"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-xs font-bold text-[#2d1400]">
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
                      onClick={() => openAuth("signin")}
                      className="rounded-full border border-white/15 px-4 py-2 text-zinc-100 transition hover:border-white/30"
                    >
                      {currentCopy.signIn}
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuth("register")}
                      className="rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 px-4 py-2 font-semibold text-[#2d1400] transition hover:scale-[1.03]"
                    >
                      {currentCopy.register}
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1800px] min-h-0 flex-1 px-4 pb-4 md:px-5 md:pb-5 lg:px-6 lg:pb-6">
            <section className="hide-scrollbar h-full overflow-y-auto p-5 md:p-7">
              <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1.2fr)_290px] xl:items-start">
                <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
                  <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="royal-panel royal-panel-strong relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-transparent px-5 pb-3 pt-5 sm:rounded-[28px] sm:px-6 sm:pt-6"
                  >
                    <PanelCorners />
                    <div className="relative flex w-full flex-col items-center gap-4">
                      <div className="relative w-full overflow-hidden rounded-[22px] border border-white/10 bg-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                        <div className="w-full">
                          <VerticalImageCarousel className="p-0" intervalMs={3000} />
                        </div>
                      </div>

                      <div className="w-full max-w-4xl text-center">
                        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-orange-50/90 md:text-base">
                          {currentCopy.heroDescription}
                        </p>
                      </div>
                    </div>
                  </motion.section>

                  <section className="royal-panel rounded-[24px] border border-white/10 bg-[#14070f] p-4 sm:rounded-[28px] sm:p-5">
                    <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                      <h2 className="text-lg font-semibold sm:text-xl">{currentCopy.popularTitle}</h2>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">
                        IST
                      </span>
                    </div>
                    {bookingMessage ? (
                      <p className="mb-3 rounded-2xl border border-amber-200/15 bg-amber-300/10 px-4 py-3 text-xs text-amber-100">
                        {bookingMessage}
                      </p>
                    ) : null}

                    <div className="grid items-start gap-3 md:grid-cols-2">
                      {currentCopy.tickets.map((ticket, index) => {
                        const gradients = [
                          "from-[#2ca7ff] to-[#6157ff]",
                          "from-[#ff7b38] to-[#ff3d6e]",
                          "from-[#7a5cff] to-[#c052ff]",
                          "from-[#e0a60d] to-[#ff7b38]",
                          "from-[#00c6ff] to-[#0072ff]",
                          "from-[#f857a6] to-[#ff5858]",
                          "from-[#56ab2f] to-[#a8e063]",
                        ];
                        const accent = gradients[index % gradients.length];
                        const live = findLiveDraw(ticket.name);
                        const remaining = live?.availableTickets ?? null;
                        const total = live?.totalTickets ?? null;
                        const pctLeft =
                          remaining != null && total && total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : null;

                        return (
                          <motion.article
                            key={ticket.name}
                            whileHover={{ boxShadow: "0 0 28px rgba(255, 153, 0, 0.18)" }}
                            transition={{ duration: 0.18 }}
                            className={`group self-start rounded-3xl bg-gradient-to-r p-[2px] ${accent} transition`}
                          >
                            <div className="flex flex-col overflow-hidden rounded-[22px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                              <div className="flex flex-col bg-[#120b0f] p-3 transition-[border-radius] duration-300 ease-out sm:p-4 rounded-[22px] group-hover:rounded-t-[22px] group-hover:rounded-b-[14px]">
                                <div className="flex items-start justify-between gap-2 sm:gap-3">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-semibold leading-snug text-zinc-100 sm:text-xs md:text-sm">
                                      {ticket.name}
                                    </p>
                                    <p className="mt-1 text-base font-bold leading-tight text-amber-300 sm:text-lg md:text-xl">
                                      {ticket.prize}
                                    </p>
                                  </div>
                                  <div className="max-w-[48%] shrink-0 rounded-xl bg-white/10 px-2 py-1.5 text-right text-[9px] leading-tight text-zinc-100 sm:rounded-2xl sm:px-2.5 sm:py-2 sm:text-[10px] md:text-xs">
                                    {ticket.time}
                                  </div>
                                </div>
                                {pctLeft != null ? (
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                                      <span>
                                        Only <span className="text-amber-200">{remaining?.toLocaleString("en-IN")}</span> left
                                      </span>
                                      <span>{total?.toLocaleString("en-IN")} total</span>
                                    </div>
                                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full border border-emerald-200/15 bg-gradient-to-r from-emerald-950/70 via-amber-950/50 to-red-950/60 shadow-inner shadow-black/30">
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-lime-300 to-green-500 shadow-[0_0_12px_rgba(74,222,128,0.45)]"
                                        style={{ width: `${pctLeft}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() => bookTicket(ticket)}
                                  className="mt-3 w-fit cursor-pointer rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-semibold text-white sm:mt-4 sm:px-4 sm:py-2 sm:text-xs"
                                >
                                  {currentCopy.buyTicket}
                                </button>
                              </div>
                              <div
                                className={`h-0 shrink-0 overflow-hidden bg-gradient-to-r transition-[height] duration-300 ease-out rounded-b-[22px] group-hover:h-[36px] group-hover:rounded-t-[14px] ${accent}`}
                                aria-hidden
                              />
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>
                  </section>
                </div>

                <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
                  <RightInsightColumn
                    currentCopy={currentCopy}
                    countdown={countdown}
                    nextDraw={nextDraw}
                  />

                  <section className="royal-panel min-w-0 rounded-[24px] border border-white/10 bg-[#14070f] p-4 sm:rounded-[28px] sm:p-5">
                    <h2 className="text-lg font-semibold sm:text-xl">{currentCopy.liveResultsTitle}</h2>
                    <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
                      {currentCopy.resultRows.map((row) => (
                        <motion.div
                          key={row.name}
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.16 }}
                          className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-2.5 sm:py-3"
                        >
                          <span className="text-sm text-zinc-200">{row.name}</span>
                          <span className="rounded-full bg-amber-300/12 px-3 py-1 text-xs font-semibold text-amber-200">
                            {row.result}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  <motion.section
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.18 }}
                    className="royal-panel rounded-[24px] border border-orange-300/15 bg-gradient-to-r from-[#582313] via-[#8a2b13] to-[#d37b13] p-4 sm:rounded-[28px] sm:p-5"
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-orange-100/85 sm:text-xs">
                      UPI • Instant results
                    </p>
                    <h2 className="mt-2 max-w-lg text-xl font-semibold leading-snug sm:mt-3 sm:text-2xl">
                      {currentCopy.footerTitle}
                    </h2>
                    {currentCopy.footerDescription ? (
                      <p className="mt-2 max-w-xl text-xs leading-6 text-orange-50/90 sm:text-sm sm:leading-7">
                        {currentCopy.footerDescription}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        if (!authUser) openAuth("register");
                        else if (liveDraws.length) openTicketModal(liveDraws[0]);
                        else setProfileOpen(true);
                      }}
                      className="mt-4 rounded-full bg-[#180808] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.03] sm:mt-5"
                    >
                      {currentCopy.footerButton}
                    </button>
                  </motion.section>
                </div>
              </div>

              <section className="royal-panel mt-4 overflow-hidden rounded-[28px] border border-white/10 bg-[#14070f] p-5 sm:mt-5">
                <div className="pointer-events-none absolute inset-0 opacity-60">
                  <div className="absolute left-[-6rem] top-[-6rem] h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
                  <div className="absolute right-[-7rem] bottom-[-7rem] h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
                </div>

                <div className="relative mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">
                      Trusted results
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">Celebrating Our Winners</h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      Recent wins from verified ticket buyers.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    {winners.length} winners
                  </span>
                </div>

                <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {winners.map((winner, index) => {
                    const palette = [
                      "from-amber-400/30 to-orange-500/25",
                      "from-cyan-400/25 to-blue-500/25",
                      "from-emerald-400/25 to-lime-500/20",
                      "from-fuchsia-400/25 to-purple-500/25",
                      "from-sky-400/25 to-teal-500/20",
                    ];

                    return (
                      <WinnerCard
                        key={winner.image}
                        imageName={winner.image}
                        amount={winner.amount}
                        gradientClass={palette[index % palette.length]}
                        burstKey={winnerBurst.image === winner.image ? winnerBurst.key : 0}
                        onBurst={() => {
                          setWinnerBurst((current) => ({
                            image: winner.image,
                            key: current.key + 1,
                          }));
                        }}
                      />
                    );
                  })}
                </div>
              </section>

            </section>
          </div>
        </div>
      </main>
      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        onAuthed={(user) => {
          setAuthUser(user);
          const params = new URLSearchParams(window.location.search);
          const next = params.get("next");
          if (next) router.push(next);
          else setProfileOpen(true);
        }}
      />
      <ProfilePanel
        open={profileOpen}
        user={authUser}
        onClose={() => setProfileOpen(false)}
        onUserUpdated={updateAuthedUser}
      />
      <TicketBookingModal
        draw={ticketModalDraw}
        user={authUser}
        open={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        onNeedAuth={() => {
          setTicketModalOpen(false);
          openAuth("signin");
        }}
      />
    </div>
  );
}
