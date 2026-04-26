"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@client/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }

    setIsLoading(true);
    try {
      await signUp(name, email, password);
      router.push("/");
    } catch (err) {
      setError("Ошибка при регистрации. Возможно, email уже занят.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: "100vh" }}>
      <div className="container">
        <div className="modal active" style={{ position: "relative", transform: "none", top: "auto", left: "auto", margin: "0 auto", maxWidth: "450px" }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: "1.5rem" }}>Регистрация</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", color: "#888" }}>Имя пользователя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    required
                    minLength={2}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", color: "#888" }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", color: "#888" }}>Пароль</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", color: "#888" }}>Подтверждение пароля</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>
                {error && <p style={{ color: "#ef4444", marginBottom: "15px" }}>{error}</p>}
                <button type="submit" className="btn-submit" disabled={isLoading}>
                  {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                </button>
              </form>
              <p style={{ textAlign: "center", marginTop: "20px", color: "#888" }}>
                Уже есть аккаунт? <Link href="/login" style={{ color: "#fff" }}>Войти</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
