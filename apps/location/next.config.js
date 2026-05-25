/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/location',
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3-eu-west-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'artefacturbain.ca',
      }
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/product/:slug*',
        destination: '/products/:slug*',
        permanent: true,
      },
      {
        source: '/produit/:slug*',
        destination: '/products/:slug*',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
