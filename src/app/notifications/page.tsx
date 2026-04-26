"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@client/hooks/useAuth";
import { useRouter } from "next/navigation";
import { trpc } from "@client/lib/TRPCProvider";

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Загрузка уведомлений через tRPC
  const { data: notifications, refetch } = trpc.user.getNotifications.useQuery(
    { userId: user?.id || "", unreadOnly: filter === "unread" },
    { enabled: !!user?.id }
  );

  const markAsReadMutation = trpc.user.markNotificationAsRead.useMutation();
  const markAllAsReadMutation = trpc.user.markAllNotificationsAsRead.useMutation();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleMarkAsRead = async (id: string) => {
    await markAsReadMutation.mutateAsync({ id });
    refetch();
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllAsReadMutation.mutateAsync({ userId: user.id });
    refetch();
  };

  if (authLoading || !user) {
    return (
      <div className="section" style={{ minHeight: "100vh" }}>
        <div className="container">
          <div className="empty-state">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ minHeight: "100vh", paddingTop: "150px" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1>Уведомления</h1>
          <div style={{ display: "flex", gap: "15px" }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as "all" | "unread")}
              className="input-field"
              style={{ width: "auto" }}
            >
              <option value="all">Все</option>
              <option value="unread">Непрочитанные</option>
            </select>
            {notifications && notifications.length > 0 && (
              <button onClick={handleMarkAllAsRead} className="btn btn-outline">
                Отметить все как прочитанные
              </button>
            )}
          </div>
        </div>

        {notifications && notifications.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`card ${!notification.isRead ? "active" : ""}`}
                style={{
                  padding: "20px",
                  background: !notification.isRead ? "#222" : "var(--bg-card)",
                  borderLeft: !notification.isRead ? "3px solid #3b82f6" : "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "1.2rem" }}>
                        {notification.type === "comment" && "💬"}
                        {notification.type === "reply" && "↩️"}
                        {notification.type === "like" && "❤️"}
                        {notification.type === "mention" && "📢"}
                        {notification.type === "achievement" && "🏆"}
                      </span>
                      <h3 style={{ fontSize: "1rem" }}>{notification.title}</h3>
                      {!notification.isRead && (
                        <span className="tag" style={{ background: "#3b82f6", color: "#fff" }}>Новое</span>
                      )}
                    </div>
                    <p style={{ color: "#aaa", marginBottom: "10px" }}>{notification.message}</p>
                    {notification.link && (
                      <a href={notification.link} style={{ color: "#3b82f6", textDecoration: "none", fontSize: "0.9rem" }}>
                        Перейти →
                      </a>
                    )}
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="btn btn-outline"
                      style={{ padding: "5px 12px", fontSize: "0.85rem" }}
                    >
                      Прочитать
                    </button>
                  )}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "10px" }}>
                  {new Date(notification.createdAt).toLocaleString("ru-RU")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>{filter === "unread" ? "Нет непрочитанных уведомлений" : "У вас пока нет уведомлений"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
