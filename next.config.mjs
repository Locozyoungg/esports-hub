import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Allow Cloudflare Tunnel domain for HMR and cross-origin access
  allowedDevOrigins: [
    'flat-acdbentity-apollo-las.trycloudflare.com',
  ],
  // Trust proxy headers (Cloudflare Tunnel forwards protocol/host)
  turbopack: {
    root: __dirname,
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;
