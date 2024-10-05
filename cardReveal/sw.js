const basePath = "";
const cacheKeys = ["v1", "v2"];
let chosenKey = cacheKeys[0];

const addResources = async (resources) => {
  const hasKey = await caches.has(chosenKey)

  if (hasKey) {
    chosenKey = cacheKeys[1];
  }
  const cache = await caches.open(chosenKey);
  return cache.addAll(resources);
};

const storeInCache = async (request, response) => {
  const cache = await caches.open(chosenKey);
  await cache.put(request, response);
};

const deleteCacheKey = async (key) => {
  await caches.delete(key);
};

const clearOldCache = async () => {
  const keepList = cacheKeys.filter((key) => key === chosenKey);
  const keyList = await caches.keys();

  const cachesToDelete = keyList.filter((key) => !keepList.includes(key));
  return Promise.all(cachesToDelete.map(deleteCacheKey));
};

const cacheFirstRequest = async ({ request, preloadResponsePromise }) => {
  const cacheResponse = await caches.match(request);

  if (cacheResponse && cacheResponse.headers.get("Content-Length") > 0) {
    // console.log(cacheResponse.url, "Loading from cache...");
    return cacheResponse;
  }

  const preloadResponse = await preloadResponsePromise;
  if (preloadResponse) {
    console.log(request.url, "Loading from preload...");
    storeInCache(request, preloadResponse.clone());
    return preloadResponse;
  }

  try {
    console.log(request.url, "Loading live request...");
    const fetchResponse = await fetch(request);
    storeInCache(request, fetchResponse.clone());
    return fetchResponse;
  } catch (error) {
    return new Response("Network Error happened", {
      status: 408,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
};

const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    addResources([
      `${basePath}/`,
      `${basePath}/assets`,
      `${basePath}/assets/audio`,
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css",
      "https://kit.fontawesome.com/f388f70b2b.js",
      "https://ka-f.fontawesome.com/releases/v6.6.0/css/free.min.css?token=f388f70b2b"
    ])
  );
});

// self.addEventListener("waiting", (event) => {
//   console.log("waiting");
// });

self.addEventListener("activate", async (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      enableNavigationPreload(),
      clearOldCache()
    ]
  ));
});

self.addEventListener("fetch", async (event) => {
  event.respondWith(
    cacheFirstRequest({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
    })
  );
});
