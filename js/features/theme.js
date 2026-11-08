import { storage } from "../services/storage.js";

const THEME_COLORS = { dark: "#0b1220", light: "#f4f6fa" };

export function resolveInitialTheme() {
  const saved = storage.get("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  storage.set("theme", theme);
}

export function nextTheme(theme) {
  return theme === "dark" ? "light" : "dark";
}
