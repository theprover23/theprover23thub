'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { trpc } from '@/client/lib/trpc';

export default function Navbar() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/', label: 'Главная' },
    { href: '/articles', label: 'Статьи' },
    { href: '/forum', label: 'Форум' },
    { href: '/memes', label: 'Мемы' },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-yellow-400">
              🎮 Tetris Hub
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-gray-800 text-yellow-400'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Войти
            </Link>
            <Link
              href="/auth/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Регистрация
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
