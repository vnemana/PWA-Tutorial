const staticCacheName = 'site-static-v3';
const dynamicCacheName = 'site-dynamic-v1';
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/dish.jpeg',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    'pages/fallback.html'
];

//install service worker
self.addEventListener('install', evt => {
    //console.log('service worker has been installed'); 
    evt.waitUntil(
        caches.open(staticCacheName).then(cache =>{
            console.log('caching shell assets');
            cache.addAll(assets);
        })
    );
});

//activate event
self.addEventListener('activate', evt => {
    //console.log('service worker has been activated');
    evt.waitUntil(
        caches.keys().then(keys => {
            //console.log(keys);
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
                );
        })
    );
});

//fetch event
self.addEventListener('fetch', evt => {
    //console.log('fetch event', evt);
    evt.respondWith(
        caches.match(evt.request).then(cacheResponse => {
            return cacheResponse || fetch(evt.request).then(fetchResponse => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fetchResponse.clone());
                    return fetchResponse;
                })
            });
        }).catch(() => caches.match('/pages/fallback.html'))
    )
});