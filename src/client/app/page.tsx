import Navbar from '@/client/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-yellow-400 mb-6">
            Добро пожаловать в Tetris Hub
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Платформа для сообщества игроков в Тетрис. Делитесь опытом, 
            обсуждайте стратегии и находите единомышленников!
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="text-4xl mb-4">📰</div>
              <h3 className="text-xl font-semibold text-white mb-2">Статьи</h3>
              <p className="text-gray-400">
                Гайды, новости и разборы стратегий от опытных игроков
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-white mb-2">Форум</h3>
              <p className="text-gray-400">
                Обсуждения, вопросы и помощь от сообщества
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-white mb-2">Мемы</h3>
              <p className="text-gray-400">
                Весёлый контент и мемы по теме Тетриса
              </p>
            </div>
          </div>

          <div className="mt-12">
            <a
              href="/articles"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Начать изучение
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
