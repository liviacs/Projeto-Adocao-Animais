/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http",  hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
  },
  // Permite que o Next.js acesse o backend via BACKEND_URL em SSR
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3005",
  },
}

module.exports = nextConfig
