const CACHE='psych-admin-v1.3';
const ASSETS=['./','./index.html','./css/style.css','./js/app.js','./js/api.js','./js/data.js','./js/render.js','./js/utils.js','./manifest.json','./assets/icons/favicon.svg','./assets/icons/app-icon.svg','./assets/images/brand-card.jpg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).catch(()=>caches.match('./index.html'))));});
