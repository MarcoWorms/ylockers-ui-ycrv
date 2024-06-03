'use client'

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { injectedWallet, frameWallet, metaMaskWallet, walletConnectWallet, rainbowWallet, coinbaseWallet, safeWallet } from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  localhost
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import env from '@/lib/env';

const queryClient = new QueryClient();

// const newMainnet = Object.assign({}, mainnet, {
//   "id": 6969,
//   "rpcUrls": {
//     "default": {
//       "http": ["https://virtual.mainnet.rpc.tenderly.co/bb40feda-1904-4527-8de7-347b90c78112"]
//     }
//   }
// })

const config = getDefaultConfig({
  appName: 'yPrisma',
  projectId: '84801a4fb569adb34f184f543b6d1762',
  // chains: [newMainnet],
  chains: [mainnet],
  wallets: [{
    groupName: 'Popular',
    wallets: [
      injectedWallet,
      frameWallet,
      metaMaskWallet,
      walletConnectWallet,
      rainbowWallet,
      coinbaseWallet,
      safeWallet
    ]
  }],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export default function Provider ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}