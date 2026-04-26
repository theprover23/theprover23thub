"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@client/hooks/useAuth";
import { Search, Bell, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" style={{ fontWeight: 900, fontSize: "1.5rem", color: "#fff", textDecoration: "none" }}>
          Tetris Hub
        </Link>

        <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <li><Link href="/">Главная</Link></li>
          <li><Link href="/articles">Статьи</Link></li>
          <li><Link href="/forum">Форум</Link></li>
          <li><Link href="/memes">Мемы</Link></li>
          <li><Link href="/about">О проекте</Link></li>
          <li><Link href="/help">Помощь</Link></li>
          {user && <li><Link href="/profile">Профиль</Link></li>}
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Theme Toggle */}
          <ThemeToggle />

          <form onSubmit={handleSearch} style={{ display: "flex", gap: "5px" }}>
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ width: "200px", padding: "6px 12px", borderRadius: "20px" }}
            />
          </form>

          {user ? (
            <>
              <Link href="/notifications" style={{ color: "#e0e0e0" }}>
                <Bell size={20} />
              </Link>
              <button onClick={signOut} className="btn btn-outline">Выйти</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">Войти</Link>
              <Link href="/register" className="btn btn-primary">Регистрация</Link>
            </>
          )}

          <button 
            className="md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
