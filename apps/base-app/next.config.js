import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'artefacturbain.ca',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ["@repo/sanity", "@repo/ui", "sanity", "next-sanity", "lodash"],
  serverExternalPackages: [
    '@sanity/client',
    '@sanity/visual-editing',
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force absolute resolution for core dependencies to avoid monorepo hoisting issues
      'rxjs': path.resolve(__dirname, '../../node_modules/rxjs'),
      'ms': path.resolve(__dirname, '../../node_modules/ms'),
      'debug': path.resolve(__dirname, '../../node_modules/debug'),
      'castable-video': path.resolve(__dirname, '../../node_modules/castable-video'),
      '@sentry/browser': path.resolve(__dirname, '../../node_modules/@sentry/browser'),
      '@sentry/react': path.resolve(__dirname, '../../node_modules/@sentry/react'),
      'typeid-js': path.resolve(__dirname, '../../node_modules/typeid-js'),
      'md5-o-matic': path.resolve(__dirname, '../../node_modules/md5-o-matic'),
      'sha256-uint8array': path.resolve(__dirname, '../../node_modules/sha256-uint8array'),
    };
    return config;
  },
};

export default nextConfig;
