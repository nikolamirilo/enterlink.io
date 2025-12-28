import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // webpack: (config, { isServer }) => {
  //   if (isServer) {
  //     // Externalize canvas to avoid bundling issues
  //     config.externals = config.externals || [];
  //     config.externals.push({
  //       canvas: 'commonjs canvas',
  //       '@napi-rs/canvas': 'commonjs @napi-rs/canvas',
  //     });
  //   }

  //   // Disable source map warnings
  //   config.ignoreWarnings = [
  //     { module: /node_modules/ },
  //   ];

  //   return config;
  // },
  // turbopack: {
  // },
  // Increase body size limit for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
