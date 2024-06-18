'use client'

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { injectedWallet, frameWallet, metaMaskWallet, walletConnectWallet, rainbowWallet, coinbaseWallet, safeWallet } from '@rainbow-me/rainbowkit/wallets';
import { http, WagmiProvider } from 'wagmi';
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

const newMainnet = Object.assign({}, mainnet, {
  "id": 6969,
  "rpcUrls": {
    "default": {
      "http": ["https://virtual.mainnet.rpc.tenderly.co/3f8e22ef-19cc-41f2-8afa-0785f74fbcfe"]
    }
  }
})

const config = getDefaultConfig({
  appName: 'yPrisma',
  projectId: '84801a4fb569adb34f184f543b6d1762',
  chains: [newMainnet],
  // chains: [mainnet],
  transports: {
    [6969]: http(process.env.NEXT_PUBLIC_RPC_1)
  },
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
  ssr: true,
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
