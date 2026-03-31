/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@libsql/client', 'libsql'],
  // allow other origins during development (e.g. when accessing via LAN IP)
  allowedDevOrigins: ['http://192.168.18.5:3000', 'https://share.lamichhanebibek.com.np'],
}

export default nextConfig
