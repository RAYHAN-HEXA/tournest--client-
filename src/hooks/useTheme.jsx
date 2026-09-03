import { useEffect, useState } from "react";

const THEME_KEY = "tournest_theme";

export function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggleTheme: () => setDark((d) => !d) };
}
