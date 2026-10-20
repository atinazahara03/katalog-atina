"use client";

import { useEffect, useState } from "react";

export default function TombolTema() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDarkMode =
      document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark";
    setIsDark(isDarkMode);
  }, []);

  const toggleTema = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      try {
        localStorage.setItem("tema", "dark");
      } catch {}
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      try {
        localStorage.setItem("tema", "light");
      } catch {}
    }
  };

  if (!mounted) {
    return (
      <div
        className="h-9 w-9 rounded-lg border border-garis bg-permukaan sm:w-20"
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTema}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-garis bg-permukaan px-2.5 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama focus:outline-none"
      title={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
    >
      <span className="text-base leading-none">{isDark ? "☀️" : "🌙"}</span>
      <span className="hidden text-xs sm:inline">{isDark ? "Terang" : "Gelap"}</span>
    </button>
  );
}

