const CACHE = "pwa-offline";
const pages = ["./", "./index.html"];

self.addEventListener("install", function(event) {
  console.log("Install Event processing");

  event.waitUntil(
    caches.open(CACHE).then(function(cache) {
      console.log("Cached offline page during install");
      return cache.addAll(pages);
    })
  );
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        //console.log("add page to offline cache: " + response.url);
        event.waitUntil(updateCache(event.request, response.clone()));
        return response;
      })
      .catch(function(error) {
        console.log(
          "Network request Failed. Serving content from cache: " + error
        );
        return fromCache(event.request);
      })
  );
});

async function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return error page
  const cache = await caches.open(CACHE);
  const matching = await cache.match(request);
  if (!matching || matching.status === 404) {
    return Promise.reject("no-match");
  }
  return matching;
}

async function updateCache(request, response) {
  const cache = await caches.open(CACHE);
  return cache.put(request, response);
}
