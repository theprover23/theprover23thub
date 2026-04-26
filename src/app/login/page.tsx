"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@client/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (err) {
      setError("Неверный email или пароль");
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
              <h2 style={{ fontSize: "1.5rem" }}>Вход</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
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
                  />
                </div>
                {error && <p style={{ color: "#ef4444", marginBottom: "15px" }}>{error}</p>}
                <button type="submit" className="btn-submit" disabled={isLoading}>
                  {isLoading ? "Вход..." : "Войти"}
                </button>
              </form>
              <p style={{ textAlign: "center", marginTop: "20px", color: "#888" }}>
                Нет аккаунта? <Link href="/register" style={{ color: "#fff" }}>Зарегистрироваться</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
