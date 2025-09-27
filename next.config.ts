const runtimeCaching = [
  {
    urlPattern: /^https:\/\/chat-notepade\.vercel\.app\/.*$/,
    handler: "NetworkFirst",
    options: {
      cacheName: "api-cache",
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 300,
      },
    },
  },
];

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
        },
      },
    },
    {
      urlPattern: ({ url }: any) => url.pathname === "/_offline",
      handler: "NetworkOnly",
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint during next build
    ignoreDuringBuilds: true,
  },
  // your existing next config
};

module.exports = withPWA(nextConfig);
