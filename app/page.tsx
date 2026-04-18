"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

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
  sidebarTitle: string;
  sidebarBalance: string;
  sidebarAction: string;
  popularTitle: string;
  categoriesTitle: string;
  liveResultsTitle: string;
  countdownTitle: string;
  nextDrawAt: string;
  previewTitle: string;
  previewDescription: string;
  footerTitle: string;
  footerDescription: string;
  footerButton: string;
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
    sidebarTitle: "Wallet Balance",
    sidebarBalance: "INR 5,000",
    sidebarAction: "Add Money via UPI",
    popularTitle: "Popular Draws Today",
    categoriesTitle: "Explore Categories",
    liveResultsTitle: "Live Result Board",
    countdownTitle: "Next Mega Draw",
    nextDrawAt: "Next draw at",
    previewTitle: "Platform Preview",
    previewDescription:
      "Browse featured lottery screens, current jackpots, and result-focused layouts built for a modern Indian audience.",
    footerTitle: "Fast UPI checkout and live lottery results",
    footerDescription:
      "Built for Kerala, Nagaland, Sikkim, and other Indian lottery users with Hindi-English support and a smooth mobile-friendly flow.",
    footerButton: "Create Account",
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
      { name: "Kerala Bumper", prize: "INR 12 Cr", time: "Today 3:00 PM" },
      { name: "Nagaland Dear", prize: "INR 1 Cr", time: "Today 8:00 PM" },
      { name: "Kuber Gold", prize: "INR 3.2 Cr", time: "Tonight 9:00 PM" },
      { name: "Dhan Varsha", prize: "INR 85 Lakh", time: "Sunday 8:30 PM" },
    ],
    categories: [
      { title: "Bumper Draws", subtitle: "High prize pools" },
      { title: "Daily Results", subtitle: "Fast updates" },
      { title: "Quick Pick", subtitle: "Smart numbers" },
      { title: "Lucky Bundles", subtitle: "Combo tickets" },
      { title: "Refer & Earn", subtitle: "Bonus rewards" },
    ],
    resultRows: [
      { name: "Dear Morning", result: "49L 27278" },
      { name: "Dear Evening", result: "15K 10342" },
      { name: "Subhlaxmi Gold", result: "07M 44129" },
      { name: "Dhan Varsha", result: "82R 55104" },
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
    sidebarTitle: "वॉलेट बैलेंस",
    sidebarBalance: "INR 5,000",
    sidebarAction: "UPI से पैसा जोड़ें",
    popularTitle: "आज के लोकप्रिय ड्रॉ",
    categoriesTitle: "कैटेगरी एक्सप्लोर करें",
    liveResultsTitle: "लाइव रिजल्ट बोर्ड",
    countdownTitle: "अगला मेगा ड्रॉ",
    nextDrawAt: "अगला ड्रॉ",
    previewTitle: "प्लेटफॉर्म प्रीव्यू",
    previewDescription:
      "फीचर्ड लॉटरी स्क्रीन, मौजूदा जैकपॉट और रिजल्ट-केंद्रित लेआउट एक साफ और आधुनिक रूप में देखें।",
    footerTitle: "तेज UPI चेकआउट और लाइव लॉटरी रिजल्ट",
    footerDescription:
      "केरल, नागालैंड, सिक्किम और भारतीय लॉटरी यूजर्स के लिए हिंदी-अंग्रेजी सपोर्ट और आसान मोबाइल अनुभव के साथ बनाया गया।",
    footerButton: "अकाउंट बनाएं",
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
      { name: "केरल बंपर", prize: "INR 12 Cr", time: "आज 3:00 बजे" },
      { name: "नागालैंड डियर", prize: "INR 1 Cr", time: "आज 8:00 बजे" },
      { name: "कुबेर गोल्ड", prize: "INR 3.2 Cr", time: "आज रात 9:00 बजे" },
      { name: "धन वर्षा", prize: "INR 85 Lakh", time: "रविवार 8:30 बजे" },
    ],
    categories: [
      { title: "बंपर ड्रॉ", subtitle: "बड़े प्राइज पूल" },
      { title: "डेली रिजल्ट", subtitle: "तेज अपडेट" },
      { title: "क्विक पिक", subtitle: "स्मार्ट नंबर" },
      { title: "लकी बंडल", subtitle: "कॉम्बो टिकट" },
      { title: "रेफर एंड अर्न", subtitle: "बोनस रिवॉर्ड" },
    ],
    resultRows: [
      { name: "डियर मॉर्निंग", result: "49L 27278" },
      { name: "डियर इवनिंग", result: "15K 10342" },
      { name: "शुभलक्ष्मी गोल्ड", result: "07M 44129" },
      { name: "धन वर्षा", result: "82R 55104" },
    ],
  },
};

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

function Counter({ label, value, suffix }: Stat) {
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
  const [language, setLanguage] = useState<Language>("en");
  const currentCopy = copy[language];
  const [nextDraw, setNextDraw] = useState<Date>(() => getNextDrawTime(new Date()));
  const [remainingTime, setRemainingTime] = useState(0);

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
          <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#17060d]/95 px-12 py-6 backdrop-blur-xl md:px-14">
            <div className="flex items-center gap-6">
              <p className="text-lg font-semibold uppercase tracking-[0.18em] text-amber-300">
                {currentCopy.heroTitle}
              </p>
              <nav className="hidden items-center gap-5 text-sm text-zinc-300 md:flex">
                {currentCopy.navItems.map((item) => (
                  <a key={item} href="#" className="transition hover:text-white">
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
              <button className="rounded-full border border-white/15 px-4 py-2 text-zinc-100 transition hover:border-white/30">
                {currentCopy.signIn}
              </button>
              <button className="rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 px-4 py-2 font-semibold text-[#2d1400] transition hover:scale-[1.03]">
                {currentCopy.register}
              </button>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 items-start px-4 pb-4 md:px-5 md:pb-5 lg:grid-cols-[210px_minmax(0,1fr)] lg:px-6 lg:pb-6">
            <aside className="hide-scrollbar hidden h-full overflow-y-auto border-r border-white/10 bg-[#12040b]/80 px-5 pb-28 pt-8 lg:block">
              <div className="rounded-[28px] border border-orange-300/15 bg-gradient-to-b from-[#2b0a11] to-[#1a0817] p-3.5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  {currentCopy.sidebarTitle}
                </p>
                <p className="mt-2 text-[2.1rem] leading-none font-bold text-amber-300">
                  {currentCopy.sidebarBalance}
                </p>
                <button className="mt-4 w-full rounded-[20px] bg-gradient-to-r from-orange-500 to-amber-300 px-4 py-3 text-sm font-semibold text-[#381200] transition hover:scale-[1.02]">
                  {currentCopy.sidebarAction}
                </button>
              </div>

              <div className="mt-5 space-y-3 pb-10">
                {currentCopy.menu.map((item, index) => (
                  <motion.button
                    key={item}
                    whileHover={{ x: 4 }}
                    className={`w-full rounded-[20px] px-4 py-2.5 text-left text-[15px] transition ${
                      index === 0
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                        : "bg-white/[0.04] text-zinc-300 hover:text-white"
                    }`}
                  >
                    {item}
                  </motion.button>
                ))}
              </div>
            </aside>

            <section className="hide-scrollbar h-full overflow-y-auto p-5 md:p-7">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_290px]">
                <motion.section
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="royal-panel royal-panel-strong relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-r from-[#5d0f13] via-[#8d1b18] to-[#d27a12] p-6"
                >
                  <PanelCorners />
                  <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(255,221,128,0.35),transparent_70%)] md:block" />
                  <div className="relative flex flex-col items-center gap-6">
                    <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[460px]">
                      <div className="absolute inset-x-6 bottom-4 h-24 rounded-full bg-amber-300/35 blur-2xl sm:inset-x-10 sm:bottom-5" />
                      <div className="royal-panel royal-panel-strong relative overflow-hidden rounded-[30px] border border-amber-200/38 bg-[#1b0b10]/65 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-4">
                        <PanelCorners />
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(255,213,128,0.15),transparent_55%),linear-gradient(180deg,#321016,#1a090c)]">
                          <Image
                            src="/goddesslaxmi.png"
                            alt="Goddess Laxmi illustration"
                            fill
                            priority
                            sizes="(max-width: 640px) 300px, (max-width: 1024px) 380px, 460px"
                            className="object-cover object-center scale-[1.06] drop-shadow-[0_0_24px_rgba(255,196,95,0.28)]"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_58%,rgba(20,6,12,0.2)_84%,rgba(20,6,12,0.42)_100%)]" />
                        </div>
                      </div>
                    </div>

                    <div className="w-full max-w-4xl text-center">
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {currentCopy.tickets.slice(0, 3).map((ticket) => (
                          <span
                            key={ticket.name}
                            className="rounded-full border border-amber-200/25 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-amber-100"
                          >
                            {ticket.name}
                          </span>
                        ))}
                      </div>
                      <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-orange-50/90 md:text-base">
                        {currentCopy.heroDescription}
                      </p>
                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(253, 224, 71, 0.25)" }}
                          transition={{ duration: 0.18 }}
                          className="rounded-full bg-[#1b0606] px-6 py-3 text-sm font-semibold text-white"
                        >
                          {currentCopy.primaryCta}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.18 }}
                          className="rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white"
                        >
                          {currentCopy.secondaryCta}
                        </motion.button>
                      </div>
                      <div className="mt-6 grid gap-3 md:grid-cols-3">
                        {currentCopy.stats.map((item) => (
                          <Counter key={item.label} {...item} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="royal-panel rounded-[28px] border border-white/10 bg-[#140912] p-4"
                >
                  <div className="relative overflow-hidden rounded-3xl border border-purple-300/15 bg-gradient-to-br from-[#4430a3] via-[#5c34d2] to-[#e1a212] p-3">
                    <div className="relative aspect-[16/11] overflow-hidden rounded-[22px] border border-white/15">
                      <Image
                        src="/ref-purple-lottery.png"
                        alt="Purple lottery dashboard inspiration"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-[#0f1626] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">
                      {currentCopy.countdownTitle}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <TimeBox value={countdown.hours} label={currentCopy.hrs} />
                      <TimeBox value={countdown.minutes} label={currentCopy.mins} />
                      <TimeBox value={countdown.seconds} label={currentCopy.secs} />
                    </div>
                    <p className="mt-3 text-xs text-zinc-300">
                      {currentCopy.nextDrawAt} {formatDrawTime(nextDraw)}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {currentCopy.tickets.slice(0, 3).map((ticket) => (
                      <motion.div
                        key={ticket.name}
                        whileHover={{ y: -2, boxShadow: "0 0 18px rgba(255, 174, 66, 0.12)" }}
                        transition={{ duration: 0.16 }}
                        className="rounded-2xl border border-white/8 bg-white/[0.04] p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-100">{ticket.name}</p>
                            <p className="mt-1 text-lg font-bold text-amber-300">{ticket.prize}</p>
                          </div>
                          <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-200">
                            {ticket.time}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_290px]">
                <section className="royal-panel rounded-[28px] border border-white/10 bg-[#14070f] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">{currentCopy.popularTitle}</h2>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">
                      IST
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {currentCopy.tickets.map((ticket, index) => {
                      const gradients = [
                        "from-[#2ca7ff] to-[#6157ff]",
                        "from-[#ff7b38] to-[#ff3d6e]",
                        "from-[#7a5cff] to-[#c052ff]",
                        "from-[#e0a60d] to-[#ff7b38]",
                      ];

                      return (
                        <motion.article
                          key={ticket.name}
                          whileHover={{ y: -4, boxShadow: "0 0 28px rgba(255, 153, 0, 0.18)" }}
                          transition={{ duration: 0.18 }}
                          className={`rounded-3xl bg-gradient-to-r ${gradients[index]} p-[1px] transition`}
                        >
                          <div className="rounded-[calc(1.5rem-1px)] bg-[#180912] p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold">{ticket.name}</p>
                                <p className="mt-2 text-2xl font-bold text-amber-300">
                                  {ticket.prize}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs text-zinc-100">
                                {ticket.time}
                              </div>
                            </div>
                            <button className="mt-4 rounded-full bg-white/12 px-4 py-2 text-xs font-semibold text-white">
                              Buy Ticket
                            </button>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                </section>

                <section className="royal-panel rounded-[28px] border border-white/10 bg-[#14070f] p-5">
                  <h2 className="text-xl font-semibold">{currentCopy.liveResultsTitle}</h2>
                  <div className="mt-4 space-y-3">
                    {currentCopy.resultRows.map((row) => (
                      <motion.div
                        key={row.name}
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.16 }}
                        className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3"
                      >
                        <span className="text-sm text-zinc-200">{row.name}</span>
                        <span className="rounded-full bg-amber-300/12 px-3 py-1 text-xs font-semibold text-amber-200">
                          {row.result}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </div>

              <section className="royal-panel mt-5 rounded-[28px] border border-white/10 bg-[#14070f] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">{currentCopy.categoriesTitle}</h2>
                  <span className="text-xs text-zinc-400">Featured sections</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {currentCopy.categories.map((item, index) => {
                    const palette = [
                      "from-[#7827ff] to-[#4430a3]",
                      "from-[#e45321] to-[#b91c1c]",
                      "from-[#0ea5e9] to-[#2563eb]",
                      "from-[#efb70d] to-[#f97316]",
                      "from-[#db2777] to-[#9333ea]",
                    ];

                    return (
                      <motion.article
                        key={item.title}
                        whileHover={{ y: -5, scale: 1.01 }}
                        transition={{ duration: 0.18 }}
                        className={`rounded-3xl bg-gradient-to-br ${palette[index]} p-5 shadow-lg shadow-black/20`}
                      >
                        <p className="text-lg font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm text-white/80">{item.subtitle}</p>
                        <div className="mt-6 h-10 w-10 rounded-2xl bg-white/15" />
                      </motion.article>
                    );
                  })}
                </div>
              </section>

              <section className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="royal-panel rounded-[28px] border border-white/10 bg-[#14070f] p-5">
                  <h2 className="text-xl font-semibold">{currentCopy.previewTitle}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
                    {currentCopy.previewDescription}
                  </p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="rounded-3xl border border-white/10 bg-[#1b0b1d] p-3"
                    >
                      <div className="relative aspect-[16/11] overflow-hidden rounded-[20px]">
                        <Image
                          src="/ref-purple-lottery.png"
                          alt="Purple lottery UI reference"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="rounded-3xl border border-white/10 bg-[#1b0b1d] p-3"
                    >
                      <div className="relative aspect-[16/11] overflow-hidden rounded-[20px]">
                        <Image
                          src="/ref-red-dashboard.png"
                          alt="Red lottery dashboard UI reference"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.18 }}
                  className="royal-panel rounded-[28px] border border-orange-300/15 bg-gradient-to-r from-[#582313] via-[#8a2b13] to-[#d37b13] p-6"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-orange-100/85">
                    UPI • Wallet • Instant results
                  </p>
                  <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight">
                    {currentCopy.footerTitle}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-orange-50/90">
                    {currentCopy.footerDescription}
                  </p>
                  <button className="mt-6 rounded-full bg-[#180808] px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.03]">
                    {currentCopy.footerButton}
                  </button>
                </motion.div>
              </section>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
