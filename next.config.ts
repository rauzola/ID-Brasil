import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizeCss: true,
  },
  // Otimizações para CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configurações para melhor performance de CSS
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Otimizar CSS em produção
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss|sass)$/,
        chunks: 'all',
        enforce: true,
      };
    }
    return config;
  },
};

export default nextConfig;
