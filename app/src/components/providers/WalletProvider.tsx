'use client';

import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { useToastStore } from '@/lib/store/toastStore';

require('@solana/wallet-adapter-react-ui/styles.css');

export type WalletConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const { addToast } = useToastStore();

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new LedgerWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  const onError = useCallback(
    (error: Error) => {
      console.error('Wallet error:', error);
      addToast({
        title: 'Wallet Error',
        description: error.message || 'Failed to connect to wallet',
        type: 'error',
      });
    },
    [addToast]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider
        wallets={wallets}
        autoConnect={true}
        onError={onError}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export function useWalletConnection() {
  const [status, setStatus] = useState<WalletConnectionStatus>('disconnected');
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      if (typeof window === 'undefined') return;

      try {
        const { getStoredAccount } = await import('@solana/wallet-adapter-local-storage');
        const stored = getStoredAccount();
        if (stored && mounted) {
          setStatus('connecting');
        }
      } catch (error) {
        if (mounted) {
          setStatus('disconnected');
        }
      }
    };

    checkConnection();

    return () => {
      mounted = false;
    };
  }, []);

  return { status, publicKey, balance, setPublicKey, setBalance };
}

export function useWalletAddress() {
  if (typeof window === 'undefined') return null;

  try {
    const { getStoredAccount } = require('@solana/wallet-adapter-local-storage');
    const stored = getStoredAccount();
    return stored?.publicKey?.toString() || null;
  } catch {
    return null;
  }
}
