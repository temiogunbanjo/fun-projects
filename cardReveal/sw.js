const basePath = "";
const cacheKeys = ["v1", "v2"];
let chosenKey = cacheKeys[0];

const addResources = async (resources) => {
  if (caches.has(chosenKey)) {
    console.log("Using v2...");
    chosenKey = cacheKeys[1];
  }
  const cache = await caches.open(chosenKey);
  await cache.addAll(resources);
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
  await Promise.all(cachesToDelete.map(deleteCacheKey));
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
  event.waitUntil(
    addResources([
      `${basePath}/`,
      `${basePath}/assets`,
      `${basePath}/assets/audio`,
      "https://kit.fontawesome.com/f388f70b2b.js",
    ])
  );
});

self.addEventListener("activate", async (event) => {
  event.waitUntil(enableNavigationPreload());
  event.waitUntil(clients.claim());
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", async (event) => {
  event.respondWith(
    cacheFirstRequest({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
    })
  );
});
