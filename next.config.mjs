/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-cc443c3ffe6e43e581c3431029871225.r2.dev', // O teu ID real
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;