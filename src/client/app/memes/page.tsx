'use client';

import Navbar from '@/client/components/Navbar';
import { trpc } from '@/client/lib/trpc';

export default function MemesPage() {
  const { data: memes, isLoading } = trpc.memes.getAll.useQuery({
    limit: 20,
    offset: 0,
    sortBy: 'popular',
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8">Мемы</h1>
        
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">Загрузка...</div>
        ) : memes && memes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memes.map((meme) => (
              <div
                key={meme.id}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <img
                  src={meme.imageUrl}
                  alt={meme.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {meme.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>от {meme.author?.name || 'Аноним'}</span>
                    <span>👁️ {meme.views || 0}</span>
                    <span>❤️ {meme.reactions?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            Пока нет мемов. Добавьте первый!
          </div>
        )}
      </main>
    </div>
  );
}
