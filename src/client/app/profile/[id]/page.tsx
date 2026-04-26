'use client';

import { useParams } from 'next/navigation';
import Navbar from '@/client/components/Navbar';
import { trpc } from '@/client/lib/trpc';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const { data: user, isLoading } = trpc.users.getProfile.useQuery(
    { userId },
    { enabled: !!userId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="text-center text-gray-400 py-12">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="text-center text-gray-400 py-12">Пользователь не найден</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <div className="flex items-center space-x-6 mb-8">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-4xl">
                👤
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{user.name || 'Аноним'}</h1>
              {user.bio && <p className="text-gray-400 mt-2">{user.bio}</p>}
              <p className="text-sm text-gray-500 mt-1">
                На сайте с {new Date(user.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {user._count?.followers || 0}
              </div>
              <div className="text-gray-400 text-sm">Подписчиков</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {user._count?.following || 0}
              </div>
              <div className="text-gray-400 text-sm">Подписок</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {user.articles?.length || 0}
              </div>
              <div className="text-gray-400 text-sm">Статей</div>
            </div>
          </div>

          {user.articles && user.articles.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Статьи</h2>
              <div className="space-y-4">
                {user.articles.map((article) => (
                  <a
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                  >
                    <h3 className="text-lg font-medium text-yellow-400">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(article.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {user.achievements && user.achievements.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Достижения</h2>
              <div className="flex flex-wrap gap-4">
                {user.achievements.map((ua) => (
                  <div
                    key={ua.id}
                    className="bg-gray-800 rounded-lg p-4 text-center min-w-[100px]"
                  >
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="text-sm font-medium text-white">
                      {ua.achievement.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
