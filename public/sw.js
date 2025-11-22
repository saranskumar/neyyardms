importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js");

if (workbox) {
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  workbox.routing.registerRoute(
    ({ request }) =>
      ["style", "script", "image", "font"].includes(request.destination),
    new workbox.strategies.CacheFirst({
      cacheName: "static-cache",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 200,
          purgeOnQuotaError: true,
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    ({ url }) => url.pathname.includes("/rest/v1/"),
    new workbox.strategies.NetworkFirst({
      cacheName: "supabase-cache",
      networkTimeoutSeconds: 8
    })
  );

  const bgQueue = new workbox.backgroundSync.Queue("posQueue", {
    maxRetentionTime: 24 * 60
  });

  workbox.routing.registerRoute(
    ({ request }) =>
      request.method === "POST" &&
      (request.url.includes("/rest/v1/rpc/") || request.url.includes("/rpc/")),
    async ({ event }) => {
      try {
        return await fetch(event.request);
      } catch (err) {
        await bgQueue.pushRequest({ request: event.request });
        return new Response(JSON.stringify({ queued: true }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    },
    "POST"
  );
}
