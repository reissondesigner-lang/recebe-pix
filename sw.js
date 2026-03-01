const CACHE_NAME = "pix-pwa-v2";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./qrcode.min.js",
  "./config.js", // Caso o arquivo de configuração esteja no cache também
  "./sw.js"
];

// A lista de arquivos a serem armazenados no cache durante a instalação
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Ativar o service worker, limpar o cache anterior, e gerenciar as versões
self.addEventListener("activate", (e) => {
  const cacheWhitelist = [CACHE_NAME];

  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Recuperar e armazenar recursos usando o cache, buscar na rede quando necessário
self.addEventListener("fetch", (e) => {
  // Se a requisição for para um arquivo estático (padrão: HTML, JS, CSS, imagens)
  if (e.request.url.includes("index.html") || e.request.url.includes("qrcode.min.js")) {
    e.respondWith(
      caches.match(e.request).then((response) => {
        return (
          response ||
          fetch(e.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              // Adiciona a resposta ao cache
              cache.put(e.request, networkResponse.clone());
              return networkResponse;
            });
          })
        );
      })
    );
  } else {
    // Caso seja outro tipo de requisição (dinâmica, como API), apenas busque na rede
    e.respondWith(fetch(e.request));
  }
});
