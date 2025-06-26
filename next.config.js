/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public', // Output directory for service worker and manifest
  register: true, // Automatically register the service worker
  skipWaiting: true, // Activate new service worker immediately
});

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = withPWA(nextConfig);