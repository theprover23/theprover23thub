import type { Metadata } from 'next';
import './globals.css';
import { TRPCProvider } from '@/client/lib/TRPCProvider';

export const metadata: Metadata = {
  title: 'Tetris Hub - Сообщество игроков',
  description: 'Веб-платформа для общения, публикации контента и обсуждения игры Тетрис',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
