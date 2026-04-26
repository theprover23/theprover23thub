'use client';

import Navbar from '@/client/components/Navbar';
import { trpc } from '@/client/lib/trpc';

export default function ForumPage() {
  const { data: categories, isLoading } = trpc.forum.getCategories.useQuery();

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8">Форум</h1>
        
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">Загрузка...</div>
        ) : categories && categories.length > 0 ? (
          <div className="grid gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800"
              >
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-400 mb-4">{category.description}</p>
                )}
                
                {category.threads && category.threads.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">
                      Последние обсуждения
                    </h3>
                    {category.threads.map((thread) => (
                      <div
                        key={thread.id}
                        className="flex items-center justify-between py-2 border-t border-gray-800 pt-3"
                      >
                        <div>
                          <a
                            href={`/forum/threads/${thread.id}`}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          >
                            {thread.title}
                          </a>
                          <p className="text-sm text-gray-500">
                            от {thread.author?.name || 'Аноним'} •{' '}
                            {thread.replies?.length || 0} ответов
                          </p>
                        </div>
                        <span className="text-xs text-gray-600">
                          {new Date(thread.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Пока нет тем в этой категории</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            Форум пока пуст
          </div>
        )}
      </main>
    </div>
  );
}
