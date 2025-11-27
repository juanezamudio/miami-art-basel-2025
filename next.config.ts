import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration for web3 compatibility
  webpack: (config, { isServer }) => {
    // Handle node-specific modules for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };

      // Handle optional wagmi connector dependencies as empty modules
      config.resolve.alias = {
        ...config.resolve.alias,
        '@base-org/account': false,
        '@gemini-wallet/core': false,
        '@metamask/sdk': false,
        'porto': false,
        '@safe-global/safe-apps-sdk': false,
        '@safe-global/safe-apps-provider': false,
      };
    }

    // Exclude problematic packages from bundling
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push('pino', 'pino-pretty', 'thread-stream');
    }

    return config;
  },
  // Transpile web3 packages
  transpilePackages: [
    '@web3modal/wagmi',
    '@web3modal/core',
    '@web3modal/ui',
    '@web3modal/base',
    '@walletconnect/ethereum-provider',
    '@walletconnect/universal-provider',
  ],
};

export default nextConfig;
