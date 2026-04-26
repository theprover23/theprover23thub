'use client';

import { useState } from 'react';
import Navbar from '@/client/components/Navbar';
import { trpc } from '@/client/lib/trpc';

export default function ArticlesPage() {
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data: articles, isLoading } = trpc.articles.getAll.useQuery({
    limit,
    offset: page * limit,
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8">Статьи</h1>
        
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">Загрузка...</div>
        ) : articles && articles.length > 0 ? (
          <div className="grid gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-white mb-2">
                      {article.title}
                    </h2>
                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {article.content.substring(0, 200)}...
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Автор: {article.author?.name || 'Аноним'}</span>
                      <span>👁️ {article.views || 0}</span>
                      <span>💬 {article._count?.comments || 0}</span>
                      <span>❤️ {article._count?.reactions || 0}</span>
                    </div>
                  </div>
                  {article.published === false && (
                    <span className="bg-yellow-900 text-yellow-400 px-2 py-1 rounded text-xs">
                      Черновик
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            Пока нет статей. Будьте первым!
          </div>
        )}

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Назад
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!articles || articles.length < limit}
            className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Вперёд
          </button>
        </div>
      </main>
    </div>
  );
}
