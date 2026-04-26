"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@client/lib/TRPCProvider";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState<"all" | "articles" | "forum" | "memes" | "users">("all");

  // Глобальный поиск через tRPC (можно расширить на сервере)
  const { data: articles, isLoading: articlesLoading } = trpc.article.search.useQuery(
    { query },
    { enabled: !!query && (activeTab === "all" || activeTab === "articles") }
  );

  const { data: forumThreads, isLoading: forumLoading } = trpc.forum.search.useQuery(
    { query },
    { enabled: !!query && (activeTab === "all" || activeTab === "forum") }
  );

  const { data: memes, isLoading: memesLoading } = trpc.meme.search.useQuery(
    { query },
    { enabled: !!query && (activeTab === "all" || activeTab === "memes") }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector("input")?.value;
    if (input?.trim()) {
      router.push(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };

  const totalResults = (articles?.length || 0) + (forumThreads?.length || 0) + (memes?.length || 0);

  return (
    <div className="section" style={{ minHeight: "100vh", paddingTop: "150px" }}>
      <div className="container">
        <h1>Поиск</h1>

        <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "30px auto", display: "flex", gap: "10px" }}>
          <input
            type="text"
            defaultValue={query}
            placeholder="Поиск по статьям, форуму, мемам..."
            className="input-field"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">Найти</button>
        </form>

        {query && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <p style={{ color: "#888" }}>
                {totalResults > 0 
                  ? `Найдено результатов: ${totalResults}`
                  : "Ничего не найдено"}
              </p>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`btn ${activeTab === "all" ? "btn-primary" : "btn-outline"}`}
                  style={{ padding: "6px 15px", fontSize: "0.9rem" }}
                >
                  Все
                </button>
                <button
                  onClick={() => setActiveTab("articles")}
                  className={`btn ${activeTab === "articles" ? "btn-primary" : "btn-outline"}`}
                  style={{ padding: "6px 15px", fontSize: "0.9rem" }}
                >
                  Статьи ({articles?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("forum")}
                  className={`btn ${activeTab === "forum" ? "btn-primary" : "btn-outline"}`}
                  style={{ padding: "6px 15px", fontSize: "0.9rem" }}
                >
                  Форум ({forumThreads?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("memes")}
                  className={`btn ${activeTab === "memes" ? "btn-primary" : "btn-outline"}`}
                  style={{ padding: "6px 15px", fontSize: "0.9rem" }}
                >
                  Мемы ({memes?.length || 0})
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "30px" }}>
              <div>
                {(activeTab === "all" || activeTab === "articles") && articles && articles.length > 0 && (
                  <section style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.2rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                      📚 Статьи
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      {articles.map((article: any) => (
                        <Link key={article.id} href={`/articles/${article.id}`} className="card" style={{ padding: "20px", textDecoration: "none", color: "inherit" }}>
                          <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>{article.title}</h3>
                          <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "10px" }}>
                            {article.excerpt || article.content?.substring(0, 150)}...
                          </p>
                          <div style={{ fontSize: "0.85rem", color: "#666" }}>
                            Автор: {article.author?.name || "Аноним"} • 👁 {article.views} • ❤️ {article.likes}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {(activeTab === "all" || activeTab === "forum") && forumThreads && forumThreads.length > 0 && (
                  <section style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.2rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                      💬 Форум
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      {forumThreads.map((thread: any) => (
                        <Link key={thread.id} href={`/forum/${thread.id}`} className="post" style={{ textDecoration: "none", color: "inherit" }}>
                          <div className="post-votes">
                            <span style={{ fontWeight: 600 }}>{thread.repliesCount}</span>
                          </div>
                          <div className="post-content">
                            <div className="post-header">
                              <span className="post-type-badge">{thread.category?.name || "Общее"}</span>
                              <span>•</span>
                              <span>{thread.author?.name || "Аноним"}</span>
                            </div>
                            <h3 style={{ fontSize: "1rem", marginBottom: "5px" }}>{thread.title}</h3>
                            <div style={{ fontSize: "0.85rem", color: "#666" }}>
                              👁 {thread.views} • 💬 {thread.repliesCount} ответов
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {(activeTab === "all" || activeTab === "memes") && memes && memes.length > 0 && (
                  <section style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.2rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                      😂 Мемы
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
                      {memes.map((meme: any) => (
                        <div key={meme.id} className="meme-card">
                          <div className="meme-image" style={{ background: "#333", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", aspectRatio: "1" }}>
                            {meme.title}
                          </div>
                          <div style={{ padding: "15px" }}>
                            <h3 style={{ fontSize: "0.95rem", marginBottom: "8px" }}>{meme.title}</h3>
                            <div style={{ fontSize: "0.85rem", color: "#666", display: "flex", justifyContent: "space-between" }}>
                              <span>{meme.author?.name || "Аноним"}</span>
                              <span>❤️ {meme.likes}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {totalResults === 0 && !articlesLoading && !forumLoading && !memesLoading && (
                  <div className="empty-state">
                    <p>По запросу "{query}" ничего не найдено</p>
                    <p style={{ fontSize: "0.9rem", marginTop: "10px" }}>Попробуйте изменить формулировку или использовать другие ключевые слова</p>
                  </div>
                )}
              </div>

              <aside>
                <div className="sidebar-card">
                  <h3 style={{ marginBottom: "15px" }}>🔍 Популярные запросы</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Link href="/search?q=T-Spin" className="tag" style={{ textDecoration: "none" }}>#T-Spin</Link>
                    <Link href="/search?q=спринт" className="tag" style={{ textDecoration: "none" }}>#спринт</Link>
                    <Link href="/search?q=стратегии" className="tag" style={{ textDecoration: "none" }}>#стратегии</Link>
                    <Link href="/search?q=турнир" className="tag" style={{ textDecoration: "none" }}>#турнир</Link>
                    <Link href="/search?q=4-wide" className="tag" style={{ textDecoration: "none" }}>#4-wide</Link>
                  </div>
                </div>

                <div className="sidebar-card" style={{ marginTop: "20px" }}>
                  <h3 style={{ marginBottom: "15px" }}>💡 Советы по поиску</h3>
                  <ul style={{ fontSize: "0.85rem", color: "#888", paddingLeft: "20px" }}>
                    <li>Используйте короткие запросы</li>
                    <li>Пробуйте разные формулировки</li>
                    <li>Фильтруйте по категориям</li>
                    <li>Проверяйте популярные запросы</li>
                  </ul>
                </div>
              </aside>
            </div>
          </>
        )}

        {!query && (
          <div className="empty-state" style={{ marginTop: "60px" }}>
            <p>Введите поисковый запрос для начала поиска</p>
            <p style={{ fontSize: "0.9rem", marginTop: "10px", color: "#666" }}>
              Поиск работает по статьям, темам форума и мемам
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
