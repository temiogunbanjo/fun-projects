const basePath = "";
const cacheKeys = ["v1", "v2"];
let chosenKey = cacheKeys[0];

const addResources = async (resources) => {
  if (caches.has(chosenKey)) {
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
  const keepList = ["v2"];
  const keyList = await caches.keys();

  const cachesToDelete = keyList.filter((key) => !keepList.includes(key));
  await Promise.all(cachesToDelete.map(deleteCacheKey));
};

const cacheFirstRequest = async (request) => {
  const cacheResponse = await caches.match(request);

  if (cacheResponse && cacheResponse.headers.get("Content-Length") > 0) {
    // console.log(cacheResponse.url, "Loading from cache...");
    return cacheResponse;
  }

  console.log(request.url, "Loading live request...");
  const fetchResponse = await fetch(request);
  storeInCache(request, fetchResponse.clone());
  return fetchResponse;
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
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", async (event) => {
  event.respondWith(cacheFirstRequest(event.request));
});
