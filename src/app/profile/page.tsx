"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@client/hooks/useAuth";
import { useRouter } from "next/navigation";
import { trpc } from "@client/lib/TRPCProvider";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");

  // Загрузка данных пользователя через tRPC
  const { data: userData, isLoading: userLoading } = trpc.user.getById.useQuery(
    { id: user?.id || "" },
    { enabled: !!user?.id }
  );

  const updateProfileMutation = trpc.user.updateProfile.useMutation();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (userData?.bio) {
      setBio(userData.bio);
    }
  }, [user, authLoading, userData, router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await updateProfileMutation.mutateAsync({
        id: user.id,
        bio,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Ошибка при обновлении профиля", err);
    }
  };

  if (authLoading || userLoading) {
    return (
      <div className="section" style={{ minHeight: "100vh" }}>
        <div className="container">
          <div className="empty-state">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = userData?.stats ? JSON.parse(userData.stats as string) : { articles: 0, comments: 0, likes: 0, achievements: [] };

  return (
    <div className="section" style={{ minHeight: "100vh", paddingTop: "150px" }}>
      <div className="container">
        <h1>Профиль пользователя</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px", marginTop: "40px" }}>
          {/* Основная информация */}
          <div className="card" style={{ padding: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: "1.5rem" }}>{user.name}</h2>
                <p style={{ color: "#888" }}>{user.email}</p>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ fontSize: "1.2rem" }}>О себе</h3>
                <button onClick={() => setIsEditing(!isEditing)} className="btn btn-outline">
                  {isEditing ? "Отмена" : "Редактировать"}
                </button>
              </div>
              {isEditing ? (
                <>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="input-field"
                    rows={4}
                    style={{ resize: "vertical" }}
                  />
                  <button onClick={handleSaveProfile} className="btn btn-primary" style={{ marginTop: "10px" }}>
                    Сохранить
                  </button>
                </>
              ) : (
                <p style={{ color: "#aaa" }}>{bio || "Биография не указана"}</p>
              )}
            </div>

            {/* Рейтинг активности */}
            <div style={{ marginBottom: "20px", padding: "15px", background: "var(--bg)", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "10px" }}>⭐ Рейтинг активности</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>{userData?.rating || 0}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#888", fontSize: "0.9rem" }}>
                    +10 за статью • +2 за комментарий • +1 за лайк
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Сайдбар со статистикой */}
          <aside>
            <div className="sidebar-card">
              <h3 style={{ marginBottom: "15px" }}>📊 Статистика</h3>
              <ul className="stats-list">
                <li className="stat-item"><span>Статей</span><span>{stats.articles || 0}</span></li>
                <li className="stat-item"><span>Комментариев</span><span>{stats.comments || 0}</span></li>
                <li className="stat-item"><span>Лайков</span><span>{stats.likes || 0}</span></li>
              </ul>
            </div>

            <div className="sidebar-card" style={{ marginTop: "20px" }}>
              <h3 style={{ marginBottom: "15px" }}>🏆 Достижения</h3>
              {stats.achievements && stats.achievements.length > 0 ? (
                <ul className="stats-list">
                  {stats.achievements.map((achievement: string, index: number) => (
                    <li key={index} className="stat-item" style={{ color: "#aaa" }}>{achievement}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#888", fontSize: "0.9rem" }}>Пока нет достижений</p>
              )}
            </div>

            <Link href="/notifications" className="sidebar-card" style={{ marginTop: "20px", display: "block", textDecoration: "none", color: "inherit" }}>
              <h3 style={{ marginBottom: "10px" }}>🔔 Уведомления</h3>
              <p style={{ color: "#888", fontSize: "0.9rem" }}>Перейти к уведомлениям →</p>
            </Link>
          </aside>
        </div>

        {/* Контент пользователя */}
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>Мои публикации</h2>
          <div className="empty-state">
            <p>У вас пока нет публикаций. Создайте первую статью или мем!</p>
            <div style={{ display: "flex", gap: "15px", marginTop: "20px", justifyContent: "center" }}>
              <Link href="/articles/new" className="btn btn-primary">Создать статью</Link>
              <button className="btn btn-outline">Загрузить мем</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
