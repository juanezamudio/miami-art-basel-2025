'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';
import { ReactNode } from 'react';
import { CURRENT_SEASON } from '@/lib/season';

// Get a project ID from https://cloud.walletconnect.com - it's free
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo';

const metadata = {
  name: `Basel.ai – Miami Art Week ${CURRENT_SEASON.year}`,
  description: `Your guide to Miami Art Week ${CURRENT_SEASON.year} events`,
  url: 'https://miami-art-basel-2025.vercel.app',
  icons: ['https://miami-art-basel-2025.vercel.app/icon.png'],
};

const config = createConfig({
  ssr: true,
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  // Connector setup opens browser storage immediately. Do not instantiate
  // wallet clients while Next.js prerenders event pages on the server.
  connectors: typeof window === 'undefined' ? [] : [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
  ],
});

const queryClient = new QueryClient();

if (typeof window !== 'undefined') createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#9333ea',
    '--w3m-border-radius-master': '8px',
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
