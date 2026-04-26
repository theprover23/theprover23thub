"use client";

import { useState } from "react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Как зарегистрироваться на сайте?",
    answer: "Нажмите кнопку «Регистрация» в навигационной панели, заполните форму (имя пользователя, email, пароль) и подтвердите регистрацию. После этого вы сможете войти в свой аккаунт."
  },
  {
    question: "Как опубликовать статью?",
    answer: "Перейдите в раздел «Статьи» и нажмите кнопку «Новая статья». Заполните заголовок, содержание (можно добавлять изображения), выберите теги и опубликуйте. Статья появится после модерации."
  },
  {
    question: "Как получить достижения?",
    answer: "Достижения выдаются автоматически за активность: публикацию статей, комментарии, участие в форуме, получение лайков. Проверьте свой профиль в разделе «Достижения»."
  },
  {
    question: "Что такое рейтинг активности?",
    answer: "Рейтинг активности начисляется за публикации статей (+10), комментарии (+2), получение лайков (+1 за каждый). Рейтинг отображается в профиле пользователя."
  },
  {
    question: "Как пожаловаться на контент?",
    answer: "На каждой статье, комментарии или теме форума есть кнопка «Пожаловаться». Нажмите её, укажите причину жалобы, и модераторы рассмотрят её в ближайшее время."
  },
  {
    question: "Можно ли загружать изображения в статьи и форум?",
    answer: "Да! При создании статьи или темы форума используйте кнопку загрузки изображений. Поддерживаются форматы JPEG, PNG, GIF, WebP размером до 5MB."
  },
  {
    question: "Как изменить тему оформления?",
    answer: "В настройках профиля можно выбрать светлую или тёмную тему. Изменения применятся сразу для всех страниц сайта."
  },
  {
    question: "Как подписаться на пользователя?",
    answer: "Перейдите в профиль интересующего вас пользователя и нажмите кнопку «Подписаться». Вы будете получать уведомления о его новых публикациях."
  },
  {
    question: "Как отметить решение в форуме?",
    answer: "Если вы создали тему с вопросом и получили helpful ответ, нажмите кнопку «Отметить как решение» рядом с подходящим ответом. Это поможет другим пользователям."
  },
  {
    question: "Куда обращаться при проблемах?",
    answer: "Для технических проблем создайте тему в разделе «Баг-репорты» или напишите на support@tetrishub.com. Для вопросов по правилам — moderation@tetrishub.com."
  }
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="section" style={{ minHeight: "100vh", paddingTop: "150px" }}>
      <div className="container">
        <h1>Помощь</h1>
        <p className="section-info">Часто задаваемые вопросы и ответы на них</p>

        {/* Bot Button */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <a
            href="https://t.me/tetrishub_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontSize: "1.1rem" }}
          >
            🤷‍♂️ Задать вопрос боту
          </a>
          <p style={{ marginTop: "15px", color: "#888", fontSize: "0.9rem" }}>
            Наш Telegram-бот отвечает на стандартные вопросы 24/7
          </p>
        </div>

        {/* Search */}
        <div style={{ maxWidth: "600px", margin: "0 auto 30px" }}>
          <input
            type="text"
            placeholder="Поиск по вопросам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ textAlign: "center" }}
          />
        </div>

        {/* FAQ List */}
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {filteredFAQ.length === 0 ? (
            <div className="empty-state">
              <p>Ничего не найдено по вашему запросу</p>
            </div>
          ) : (
            filteredFAQ.map((item, index) => (
              <div key={index} className="card" style={{ marginBottom: "15px" }}>
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  style={{
                    width: "100%",
                    padding: "20px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    color: "#fff",
                    fontSize: "1.1rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{item.question}</span>
                  <span style={{ fontSize: "1.5rem", transition: "transform 0.3s", transform: openIndex === index ? "rotate(45deg)" : "rotate(0)" }}>
                    +
                  </span>
                </button>
                {openIndex === index && (
                  <div style={{ padding: "0 20px 20px", color: "#ccc", lineHeight: "1.8" }}>
                    {item.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Additional Help */}
        <div className="card" style={{ maxWidth: "800px", margin: "30px auto 0", padding: "25px", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.3rem", marginBottom: "15px" }}>Не нашли ответ?</h3>
          <p style={{ marginBottom: "20px", color: "#888" }}>
            Свяжитесь с нами через страницу <Link href="/about" style={{ color: "#3b82f6" }}>«Контакты»</Link> или создайте тему в разделе форума «Вопросы»
          </p>
          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/forum" className="btn btn-outline">Задать вопрос на форуме</Link>
            <Link href="/about" className="btn btn-outline">Контакты</Link>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <Link href="/" className="btn btn-outline">← На главную</Link>
        </div>
      </div>
    </div>
  );
}
