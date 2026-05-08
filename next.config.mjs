/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      encryptionKey: process.env.SERVER_ACTIONS_ENCRYPTION_KEY,
    },
  },
};

export default nextConfig;