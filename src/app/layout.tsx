import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@client/lib/TRPCProvider";
import { AuthProvider } from "@client/hooks/useAuth";
import Navbar from "@client/components/Navbar";

export const metadata: Metadata = {
  title: "Tetris Hub - Платформа для сообщества игроков",
  description: "Веб-платформа для общения пользователей, публикации контента и обсуждения игры Тетрис",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <TRPCProvider>
            <Navbar />
            <main>{children}</main>
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
