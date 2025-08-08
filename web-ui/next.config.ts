import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.docker.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hub.docker.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.githubassets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wac-cdn.atlassian.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.contentstack.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'duckduckgo.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'grafana.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'info.arxiv.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.datastax.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.atlan.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.couchbase.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'git-scm.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a.slack-edge.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kubernetes.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.datocms-assets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'webimages.mongodb.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wiki.postgresql.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'redis.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'labs.mysql.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sqlite.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebase.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.vercel.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.netlify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.cloudflare.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'stripe.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.twilio.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sendgrid.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.mailgun.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'modelcontextprotocol.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.beaglesecurity.com',
        pathname: '/**',
      },
      {
        protocol: 'https', 
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.githubassets.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
