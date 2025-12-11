// Service Worker 版本号
// 💡 如果你修改了 index.html 的代码，记得把这里的 'v1' 改成 'v2', 'v3'...
// 这样手机浏览器才会知道有新版本，并强制更新缓存
const CACHE_NAME = 'shopping-manager-v1';

// 需要缓存的文件列表
// 包括主页、配置文件、以及外部引用的 CDN 资源
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Tailwind CSS 样式库
  'https://cdn.tailwindcss.com',
  // 图标库脚本
  'https://unpkg.com/@phosphor-icons/web',
  // App 图标 (国内 CDN)
  'https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/e08da34488bfe3a53ed2.png'
];

// 1. 安装事件：下载并缓存核心文件
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. 激活事件：清理旧版本的缓存
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activate');
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // 如果发现缓存名字跟当前的 CACHE_NAME 不一样，就删掉它
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // 让 Service Worker 立即接管页面，不用等待下次刷新
  return self.clients.claim();
});

// 3. 请求拦截：优先使用缓存，没网也能用
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // 如果缓存里有，直接返回缓存（秒开）
      if (response) {
        return response;
      }
      // 如果缓存里没有，就去网络下载
      return fetch(e.request);
    })
  );
});