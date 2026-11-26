/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    agentUpgrade: 'security',
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
