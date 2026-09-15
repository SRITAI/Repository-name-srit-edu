/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Signed Supabase Storage URLs are dynamic (short-lived, per-request),
    // so PDFs are fetched directly rather than through next/image.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
