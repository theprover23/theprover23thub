"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="section" id="home">
      <div className="container">
        <h1>Добро пожаловать в Tetris Hub</h1>
        <p className="section-info">
          Платформа для сообщества игроков в Тетрис. Делитесь стратегиями, обсуждайте тактики и находите единомышленников!
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px", marginTop: "60px" }}>
          <Link href="/articles" className="card" style={{ padding: "30px", textDecoration: "none", color: "inherit" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>📚 Статьи</h3>
            <p style={{ color: "#888" }}>Гайды, новости и разборы по Тетрису</p>
          </Link>

          <Link href="/forum" className="card" style={{ padding: "30px", textDecoration: "none", color: "inherit" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>💬 Форум</h3>
            <p style={{ color: "#888" }}>Вопросы, обсуждения и баг-репорты</p>
          </Link>

          <Link href="/memes" className="card" style={{ padding: "30px", textDecoration: "none", color: "inherit" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>😂 Мемы</h3>
            <p style={{ color: "#888" }}>Популярные мемы про Тетрис</p>
          </Link>

          <Link href="/register" className="card" style={{ padding: "30px", textDecoration: "none", color: "inherit" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>🎮 Присоединиться</h3>
            <p style={{ color: "#888" }}>Создайте аккаунт и начните общаться</p>
          </Link>
        </div>

        <div style={{ marginTop: "80px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "30px" }}>Популярное сейчас</h2>
          <div className="empty-state">
            <p>Контент загружается... Зарегистрируйтесь, чтобы создать первый пост!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
