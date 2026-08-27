import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // The API is internal. Nothing here should ever construct a browser-facing
  // URL to it, so its address is read only in server code.
  poweredByHeader: false,
  // Absolute, because Next resolves this against the process's working
  // directory and warns when handed a relative path. It points at the
  // workspace root so tracing follows the contract package's real files
  // through the pnpm store rather than stopping at a symlink.
  outputFileTracingRoot: path.join(import.meta.dirname, '..'),
  // Standalone puts the server and only the files it traced into .next, which
  // is what the container copies.
  output: 'standalone',
  experimental: {
    // The contract package ships CommonJS from a workspace path.
    externalDir: true,
  },
};

export default config;
