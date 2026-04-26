"use client";

import { useState } from "react";
import Link from "next/link";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<"about" | "rules" | "contacts">("about");

  return (
    <div className="section" style={{ minHeight: "100vh", paddingTop: "150px" }}>
      <div className="container">
        <h1>О проекте Tetris Hub</h1>
        <p className="section-info">Добро пожаловать в сообщество любителей Тетриса</p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "30px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("about")}
            className={`btn ${activeTab === "about" ? "btn-primary" : "btn-outline"}`}
          >
            О нас
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`btn ${activeTab === "rules" ? "btn-primary" : "btn-outline"}`}
          >
            Правила
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`btn ${activeTab === "contacts" ? "btn-primary" : "btn-outline"}`}
          >
            Контакты
          </button>
        </div>

        {/* Content */}
        <div className="card" style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
          {activeTab === "about" && (
            <div>
              <h2 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>О проекте</h2>
              <p style={{ marginBottom: "15px", lineHeight: "1.8" }}>
                <strong>Tetris Hub</strong> — это веб-платформа для сообщества игроков в Тетрис. 
                Мы создали пространство, где любители этой легендарной игры могут общаться, 
                делиться опытом и узнавать новое.
              </p>
              <p style={{ marginBottom: "15px", lineHeight: "1.8" }}>
                На нашей платформе вы можете:
              </p>
              <ul style={{ marginLeft: "20px", marginBottom: "20px", lineHeight: "1.8" }}>
                <li>Читать и публиковать статьи о Тетрисе (гайды, новости, разборы стратегий)</li>
                <li>Участвовать в форуме, задавать вопросы и помогать другим игрокам</li>
                <li>Делиться мемами и забавным контентом по теме</li>
                <li>Отслеживать свою статистику и получать достижения за активность</li>
                <li>Подписываться на других пользователей и быть в курсе их активности</li>
              </ul>
              <p style={{ lineHeight: "1.8" }}>
                Наша миссия — объединить любителей Тетриса со всего мира и создать 
                дружелюбное сообщество для обмена знаниями и опытом.
              </p>
            </div>
          )}

          {activeTab === "rules" && (
            <div>
              <h2 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>Правила сообщества</h2>
              <div style={{ marginBottom: "25px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "10px", color: "#3b82f6" }}>1. Общие положения</h3>
                <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
                  <li>Уважайте других участников сообщества</li>
                  <li>Запрещены оскорбления, дискриминация и токсичное поведение</li>
                  <li>Соблюдайте законы об авторском праве</li>
                </ul>
              </div>
              <div style={{ marginBottom: "25px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "10px", color: "#3b82f6" }}>2. Публикация контента</h3>
                <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
                  <li>Статьи должны быть по теме Тетриса</li>
                  <li>Запрещён спам и реклама без согласования</li>
                  <li>Контент не должен нарушать авторские права</li>
                  <li>Изображения должны быть соответствующего содержания</li>
                </ul>
              </div>
              <div style={{ marginBottom: "25px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "10px", color: "#3b82f6" }}>3. Форум и комментарии</h3>
                <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
                  <li>Создавайте темы в соответствующих разделах</li>
                  <li>Не дублируйте существующие темы</li>
                  <li>Используйте поиск перед созданием новой темы</li>
                  <li>Отмечайте решения в вопросах</li>
                </ul>
              </div>
              <div style={{ marginBottom: "25px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "10px", color: "#3b82f6" }}>4. Модерация</h3>
                <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
                  <li>Администрация оставляет право удалять контент, нарушающий правила</li>
                  <li>За серьёзные нарушения возможна блокировка аккаунта</li>
                  <li>Решения модераторов можно обжаловать через контакты</li>
                </ul>
              </div>
              <p style={{ marginTop: "20px", fontStyle: "italic", color: "#888" }}>
                Нарушение правил может привести к предупреждению или блокировке аккаунта.
              </p>
            </div>
          )}

          {activeTab === "contacts" && (
            <div>
              <h2 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>Контакты</h2>
              <p style={{ marginBottom: "25px", lineHeight: "1.8" }}>
                По всем вопросам обращайтесь к администрации проекта:
              </p>
              
              <div style={{ marginBottom: "25px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "10px", color: "#3b82f6" }}>Администрация</h3>
                <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
                  <li><strong>Email:</strong> admin@tetrishub.com</li>
                  <li><strong>Telegram:</strong> @tetrishub_admin</li>
                  <li><strong>Discord:</strong> Tetris Hub Official Server</li>
                </ul>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "10px", color: "#3b82f6" }}>Модерация</h3>
                <p style={{ lineHeight: "1.8", marginBottom: "10px" }}>
                  Для жалоб на контент или пользователей используйте кнопку «Пожаловаться» 
                  на соответствующем материале или напишите модераторам:
                </p>
                <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
                  <li><strong>Email:</strong> moderation@tetrishub.com</li>
                  <li><strong>Telegram:</strong> @tetrishub_mods</li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "10px", color: "#3b82f6" }}>Техническая поддержка</h3>
                <p style={{ lineHeight: "1.8" }}>
                  Если у вас возникли технические проблемы, создайте тему в разделе 
                  форума «Баг-репорты» или напишите нам на email: support@tetrishub.com
                </p>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <Link href="/" className="btn btn-outline">← На главную</Link>
        </div>
      </div>
    </div>
  );
}
