const basePath = "";
const cacheKeys = ["v1", "v2"];
let chosenKey = cacheKeys[0];

const addResources = async (resources) => {
  const hasKey = await caches.has(chosenKey);

  if (hasKey) {
    chosenKey = cacheKeys[1];
  }
  const cache = await caches.open(chosenKey);
  // for (const url of resources) {
  //   try {
  //     await cache.add(url);
  //     console.log("Cached:", url);
  //   } catch (error) {
  //     console.error("Failed to cache:", url, error);
  //   }
  // }
  return cache.addAll(resources);
};

const storeInCache = async (request, response) => {
  // console.log(request.method);
  if (request.method === "GET") {
    const cache = await caches.open(chosenKey);
    await cache.put(request, response);
  } else {
    // console.log("Skipping cache for", request.method, "requests");
  }
};

const deleteCacheKey = async (key) => {
  await caches.delete(key);
};

const clearOldCache = async () => {
  console.log("clearing old cache...");
  const keepList = cacheKeys.filter((key) => key === chosenKey);
  const keyList = await caches.keys();

  const cachesToDelete = keyList.filter((key) => !keepList.includes(key));
  return Promise.all(cachesToDelete.map(deleteCacheKey));
};

const cacheFallbackRequest = async ({ request, preloadResponsePromise }) => {
  try {
    const cacheResponse = await caches.match(request);
    if (
      cacheResponse &&
      cacheResponse.headers.get("Content-Length") > 0 &&
      cacheResponse.url.includes("assets")
    ) {
      console.log(cacheResponse.url, "Loading from cache...");
      return cacheResponse;
    }

    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
      console.log(request.url, "Loading from preload...");
      storeInCache(request, preloadResponse.clone());
      return preloadResponse;
    }

    // console.log(request.url, "Loading live request...");
    const fetchResponse = await fetch(request);
    storeInCache(request, fetchResponse.clone());
    return fetchResponse;
  } catch (error) {
    const cacheResponse = await caches.match(request);
    if (cacheResponse && cacheResponse.headers.get("Content-Length") > 0) {
      console.log(cacheResponse.url, "Loading from cache...");
      return cacheResponse;
    }

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
      `${basePath}/assets/favicon.png`,
      `${basePath}/assets/bread-i8k.png`,
      `${basePath}/assets/Banana-Stack-PNG.png`,
      `${basePath}/assets/strawberry_PNG2587.png`,
      `${basePath}/assets/land-rover-range-rover-car-png-25.png`,
      `${basePath}/assets/pngimg.com - guava_PNG18.png`,
      `${basePath}/assets/pngimg.com - men_shoes_PNG7492.png`,
      `${basePath}/assets/pngimg.com - pineapple_PNG2733.png`,
      `${basePath}/assets/pngtree-dropshipping-men-hole-sole-jogging-shoes-png-image_11389148.png`,
      `${basePath}/assets/audio/wistful-1-39105.mp3`,
      `${basePath}/assets/audio/analog-appliance-button-2-185277.mp3`,
      `${basePath}/assets/audio/koiroylers-game-over-voice-355993.mp3`,
      `${basePath}/assets/audio/floraphonic-violin-lose-5-185126.mp3`,
      `${basePath}/libraries/gsap/minified/gsap.min.js`,
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css",
      "https://kit.fontawesome.com/f388f70b2b.js",
      "https://ka-f.fontawesome.com/releases/v6.6.0/css/free.min.css?token=f388f70b2b",
    ]),
  );
  self.skipWaiting();
});

self.addEventListener("activate", async (event) => {
  event.waitUntil(
    Promise.all([clients.claim(), enableNavigationPreload(), clearOldCache()]),
  );
});

self.addEventListener("fetch", async (event) => {
  event.respondWith(
    cacheFallbackRequest({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
    }),
  );
});
