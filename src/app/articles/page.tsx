"use client";

import { useState } from "react";
import Link from "next/link";

export default function ArticlesPage() {
  const [sortBy, setSortBy] = useState("newest");

  const mockArticles = [
    { id: "1", title: "Как собрать T-Spin Triple", excerpt: "Полное руководство по выполнению T-Spin Triple", author: "Player1", views: 1234, likes: 89 },
    { id: "2", title: "Лучшие стратегии для спринта 40 линий", excerpt: "Анализ топ-игроков мира", author: "SpeedRunner", views: 892, likes: 67 },
    { id: "3", title: "История Тетриса: от СССР до наших дней", excerpt: "Как игра покорила мир", author: "Historian", views: 2341, likes: 156 },
  ];

  return (
    <div className="section" id="articles">
      <div className="container">
        <h1>Статьи</h1>
        <p className="section-info">Гайды, новости и разборы по игре Тетрис</p>

        <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
            style={{ width: "auto" }}
          >
            <option value="newest">Новые</option>
            <option value="popular">Популярные</option>
            <option value="oldest">Старые</option>
          </select>
          <Link href="/articles/new" className="btn btn-primary">Создать статью</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "30px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {mockArticles.map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`} className="card" style={{ padding: "25px", textDecoration: "none", color: "inherit" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "10px" }}>{article.title}</h3>
                <p style={{ color: "#888", marginBottom: "15px" }}>{article.excerpt}</p>
                <div style={{ display: "flex", gap: "20px", fontSize: "0.85rem", color: "#666" }}>
                  <span>Автор: {article.author}</span>
                  <span>👁 {article.views}</span>
                  <span>❤️ {article.likes}</span>
                </div>
              </Link>
            ))}
          </div>

          <aside>
            <div className="sidebar-card">
              <h3 style={{ marginBottom: "15px" }}>Популярные теги</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <span className="tag">#T-Spin</span>
                <span className="tag">#Спринт</span>
                <span className="tag">#Стратегии</span>
                <span className="tag">#Для-новичков</span>
                <span className="tag">#Турниры</span>
              </div>
            </div>

            <div className="sidebar-card" style={{ marginTop: "20px" }}>
              <h3 style={{ marginBottom: "15px" }}>Популярные авторы</h3>
              <ul className="stats-list">
                <li className="stat-item"><span>Player1</span><span>12 статей</span></li>
                <li className="stat-item"><span>SpeedRunner</span><span>8 статей</span></li>
                <li className="stat-item"><span>Historian</span><span>5 статей</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
