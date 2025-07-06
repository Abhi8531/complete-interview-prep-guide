/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['openai']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  images: {
    domains: [],
  },
  // Ensure static export works properly
  output: 'standalone',
  // Disable server-side features that might cause issues on Vercel
  poweredByHeader: false,
}
 
module.exports = nextConfig 