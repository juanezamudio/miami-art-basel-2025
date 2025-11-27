import type { NextConfig } from "next";
import path from "path";

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
    }

    // Handle optional wagmi connector dependencies as empty modules
    // and provide browser-compatible pino stub (for both client and server)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@base-org/account': false,
      '@gemini-wallet/core': false,
      '@metamask/sdk': false,
      'porto': false,
      'porto/internal': false,
      '@safe-global/safe-apps-sdk': false,
      '@safe-global/safe-apps-provider': false,
      // Pino browser stub for WalletConnect (needed client-side)
      ...(isServer ? {} : {
        'pino': path.resolve(__dirname, 'src/lib/pino-browser.js'),
        'pino-pretty': path.resolve(__dirname, 'src/lib/pino-browser.js'),
      }),
    };

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
  // Empty turbopack config to silence warning about webpack config in dev mode
  // Dev uses Turbopack (faster), build uses Webpack (for web3 compatibility)
  turbopack: {},
};

export default nextConfig;
