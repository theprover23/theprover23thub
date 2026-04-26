"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForumPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: "1", name: "Общие вопросы", description: "Вопросы по игре и механике", icon: "❓", threads: 45 },
    { id: "2", name: "Стратегии и тактики", description: "Обсуждение игровых стратегий", icon: "🎯", threads: 32 },
    { id: "3", name: "Турниры", description: "Анонсы и обсуждения турниров", icon: "🏆", threads: 18 },
    { id: "4", name: "Баг-репорты", description: "Сообщения об ошибках", icon: "🐛", threads: 7 },
  ];

  const threads = [
    { id: "1", title: "Как улучшить время в спринте?", category: "Стратегии и тактики", author: "Newbie", replies: 23, views: 456, solved: true },
    { id: "2", title: "Лучший расклад для T-Spin?", category: "Стратегии и тактики", author: "ProPlayer", replies: 45, views: 892, solved: false },
    { id: "3", title: "Турнир выходного дня - регистрация", category: "Турниры", author: "Admin", replies: 67, views: 1234, solved: false },
  ];

  return (
    <div className="section" id="forum">
      <div className="container">
        <h1>Форум</h1>
        <p className="section-info">Задавайте вопросы, делитесь опытом и обсуждайте Тетрис</p>

        <Link href="/forum/new" className="btn btn-primary" style={{ marginBottom: "30px", display: "inline-block" }}>Создать тему</Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>Последние темы</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {threads.map((thread) => (
                <Link key={thread.id} href={`/forum/${thread.id}`} className="post" style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="post-votes">
                    <button className="vote-btn">▲</button>
                    <span style={{ fontWeight: 600 }}>{thread.replies}</span>
                    <button className="vote-btn">▼</button>
                  </div>
                  <div className="post-content">
                    <div className="post-header">
                      <span className="post-type-badge">{thread.category}</span>
                      <span>•</span>
                      <span>{thread.author}</span>
                      {thread.solved && <span style={{ color: "#4ade80" }}>✓ Решение</span>}
                    </div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>{thread.title}</h3>
                    <div style={{ fontSize: "0.85rem", color: "#666" }}>
                      <span>👁 {thread.views}</span> • <span>💬 {thread.replies} ответов</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <aside>
            <div className="sidebar-card">
              <h3 style={{ marginBottom: "15px" }}>Категории</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`card ${selectedCategory === cat.id ? "active" : ""}`}
                    style={{ padding: "12px", textAlign: "left", background: selectedCategory === cat.id ? "#333" : "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span>{cat.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{cat.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "#888" }}>{cat.threads} тем</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-card" style={{ marginTop: "20px" }}>
              <h3 style={{ marginBottom: "15px" }}>Правила форума</h3>
              <ul style={{ fontSize: "0.9rem", color: "#888", paddingLeft: "20px" }}>
                <li>Будьте уважительны</li>
                <li>Используйте поиск перед созданием темы</li>
                <li>Отмечайте решения</li>
                <li>Не спамьте</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
