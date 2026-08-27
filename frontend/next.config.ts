import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // The API is internal. Nothing here should ever construct a browser-facing
  // URL to it, so its address is read only in server code.
  poweredByHeader: false,
  outputFileTracingRoot: '..',
  // Standalone puts the server and only the files it traced into .next, which
  // is what the container copies.
  output: 'standalone',
  experimental: {
    // The contract package ships CommonJS from a workspace path.
    externalDir: true,
  },
};

export default config;
