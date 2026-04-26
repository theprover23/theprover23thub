"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@client/hooks/useAuth";

export default function ThemeToggle() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Load theme from user preference or default to dark
    const savedTheme = user?.theme || (localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    
    // Update CSS variables for light/dark theme
    const root = document.documentElement;
    if (newTheme === "light") {
      root.style.setProperty("--bg", "#f5f5f5");
      root.style.setProperty("--bg-card", "#ffffff");
      root.style.setProperty("--bg-hover", "#e0e0e0");
      root.style.setProperty("--border", "#ddd");
      root.style.setProperty("--text-main", "#1a1a1a");
      root.style.setProperty("--text-muted", "#666");
    } else {
      root.style.setProperty("--bg", "#0a0a0a");
      root.style.setProperty("--bg-card", "#1a1a1a");
      root.style.setProperty("--bg-hover", "#222");
      root.style.setProperty("--border", "#333");
      root.style.setProperty("--text-main", "#ffffff");
      root.style.setProperty("--text-muted", "#888");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-outline"
      style={{ padding: "6px 12px", borderRadius: "20px" }}
      title={theme === "dark" ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
