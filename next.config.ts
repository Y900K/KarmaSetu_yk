import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: wss:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://drive.google.com https://docs.google.com https://*.googleusercontent.com; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
