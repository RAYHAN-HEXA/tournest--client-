import { createContext, useContext } from "react";
import { useTheme } from "../hooks/useTheme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { dark, toggleTheme } = useTheme();
  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used inside ThemeProvider");
  return ctx;
}
