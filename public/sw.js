
// Nome e versão do cache
const CACHE_NAME = 'oficina-pro-v1';

// Arquivos para armazenar em cache em uma instalação inicial
const INITIAL_CACHED_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Durante a fase de instalação, armazene em cache os recursos iniciais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(INITIAL_CACHED_RESOURCES);
      })
      .then(() => {
        // Force o service worker a se tornar ativo ignorando a espera
        return self.skipWaiting();
      })
  );
});

// Limpe caches antigos durante a ativação
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Tome o controle imediato de todas as páginas sob o escopo
      return self.clients.claim();
    })
  );
});

// Intercepte as solicitações de rede
self.addEventListener('fetch', event => {
  // Evite interceptar solicitações de API - buscamos sempre as mais recentes
  if (event.request.url.includes('/api/')) {
    // Para solicitações de API, tente a rede primeiro, caia para o cache
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Para outros recursos, use a estratégia "Cache first, rede como fallback, atualização em segundo plano"
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Retorne o item em cache, se existir
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Atualize o cache com a nova resposta
            if (networkResponse.ok && event.request.method === 'GET') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Falha na rede, use o cache como fallback final
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      })
  );
});

// Lidar com mensagens de sincronização em segundo plano
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Código para enviar dados armazenados localmente ao servidor
      // Isto seria implementado com IndexedDB
      console.log('Sincronização em segundo plano acionada')
    );
  }
});
