"use client";

import { useState } from "react";
import Link from "next/link";

export default function MemesPage() {
  const [sortBy, setSortBy] = useState("popular");

  const mockMemes = [
    { id: "1", title: "Когда сделал T-Spin Triple", image: "/placeholder1.jpg", likes: 234, author: "MemeLord" },
    { id: "2", title: "Tetris effect в реальной жизни", image: "/placeholder2.jpg", likes: 189, author: "FunnyGuy" },
    { id: "3", title: "4-wide стратегия be like", image: "/placeholder3.jpg", likes: 156, author: "ProMemer" },
    { id: "4", title: "Когда линия не падает куда надо", image: "/placeholder4.jpg", likes: 312, author: "Relatable" },
  ];

  return (
    <div className="section" id="memes">
      <div className="container">
        <h1>Мемы</h1>
        <p className="section-info">Смешные картинки про Тетрис от сообщества</p>

        <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
            style={{ width: "auto" }}
          >
            <option value="popular">Популярные</option>
            <option value="newest">Новые</option>
          </select>
          <button className="btn btn-primary">Загрузить мем</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" }}>
          {mockMemes.map((meme) => (
            <div key={meme.id} className="meme-card">
              <div className="meme-image" style={{ background: "#333", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
                {meme.title}
              </div>
              <div style={{ padding: "15px" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>{meme.title}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#666" }}>
                  <span>{meme.author}</span>
                  <span>❤️ {meme.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
