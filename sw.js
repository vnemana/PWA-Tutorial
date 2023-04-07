const staticCacheName = 'site-static-v21';
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

//cache size limit function
const limitCacheSize = (name, size) => { 
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            keys.forEach(k => console.log(k.url));
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
};

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
    // console.log('service worker has been activated');
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
    evt.respondWith(
        caches.match(evt.request).then(cacheResponse => {
            return cacheResponse || fetch(evt.request).then(fetchResponse => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fetchResponse.clone());
                    limitCacheSize(dynamicCacheName, 15);
                    return fetchResponse;
                })
            });
        }).catch(() => {
            if(evt.request.url.indexOf('.html') > -1) {
                return caches.match('/pages/fallback.html');
            }
        })
    )
});