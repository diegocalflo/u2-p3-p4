const CACHE_NAME = 'cache-v1'

const CACHE_STATIC_NAME = 'static-v1'
const CACHE_DYNAMIC_NAME = 'dynamic-v1'
const CACHE_INMUTABLE_NAME = 'inmutable-v1'

function cleanCache(cacheName, sizeItems){
    caches.open(cacheName)
        .then((response) => {
            response.keys().then(keys => {
                console.log(keys);
                if (keys >= sizeItems) {
                    response.delete(keys[0]).then(()=>{
                        clearCache(cacheName,sizeItems)
                    });
                }
            });
        });
}

self.addEventListener('install', (event) => {
    console.log('SW installed');

    const promesaChaches = caches.open(CACHE_STATIC_NAME)
        .then(cache => {
            return cache.addAll([
                '/',
                'index.html',
                'css/page.css',
                'img/kitten.png',
                'js/app.js'
            ]);
        });

        const promInmutable = caches.open(CACHE_INMUTABLE_NAME)
            .then(cacheInmutable => {
                return cacheInmutable.addAll([
                    'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css'
                ]);
            });

        event.waitUntil(Promise.all([promesaChaches, promInmutable]));
});

self.addEventListener('fetch', (event) => {

    // 2. Cache with network fallback
    // cache first, then WEB

    const respuestaCache = caches.match(event.request)
        .then(resp => {
            if(resp){
                return resp;
            }

            console.log('Is not on chache', event.request.url);

            return fetch(event.request)
                .then(respNet => {
                    caches.open(CACHE_DYNAMIC_NAME)
                        .then(cache => {
                            cache.put(event.request, respNet)
                                .then(cleanCache(CACHE_DYNAMIC_NAME, 3));
                        });
                    return respNet.clone();
                });
        });
        event.respondWith(respuestaCache)

    // 1. Only cache
    // event.respondWith(caches.match(event.request));

});


// self.addEventListener('fetch', e => {

//      const respOff = new Response(`
//            Bienvenido a la página offline
//              Para poder usar la app necesitas conexión a internet
//          `);
 
//     const respOffHtml = new Response (`
//             <!DOCTYPE html>
//             <html lang="en">
            
//             <head>
//                 <meta charset="UTF-8">
//                 <meta http-equiv="X-UA-Compatible" content="IE=edge">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Mi PWA | Caches</title>
//                 <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
//                     integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l" crossorigin="anonymous">
//                 <link rel="stylesheet" href="css/page.css">
//             </head>
            
//             <body>
//                 <h1>Offline</h1>
//                 <p>Necesitas conexión a internet para usar la app</p>
//             </body>
//             </html>
//         `, {
//             headers:{
//                 'Content-Type': 'text/html'
//             }
//         }); 

//     const respOffFile = fetch('pages/view-offline.html');

//     const resp = fetch(e.request)
//         .catch( () => {
//             console.log('SW Error on request');
//             return respOffFile;
//         });

//     e.respondWith(resp);
//     //console.log(e.request.url);
// });