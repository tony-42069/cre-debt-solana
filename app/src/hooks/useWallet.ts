'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useToastStore } from '@/lib/store/toastStore';

export function useWalletBalance() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { error: showError } = useToastStore();

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection) {
      setBalance(null);
      return;
    }

    setLoading(true);
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / 1e9);
    } catch (err) {
      console.error('Error fetching balance:', err);
      showError({
        title: 'Balance Error',
        description: 'Failed to fetch wallet balance',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection, showError]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, fetchBalance]);

  return { balance, loading, refetch: fetchBalance };
}

export function useWalletAddress() {
  const { publicKey, connected } = useWallet();

  if (!connected || !publicKey) {
    return null;
  }

  return publicKey.toString();
}

export function useWalletShortAddress() {
  const address = useWalletAddress();

  if (!address) {
    return null;
  }

  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function useDisconnectWallet() {
  const { disconnect, connected } = useWallet();
  const { toast } = useToastStore();

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      toast({
        title: 'Wallet Disconnected',
        type: 'success',
      });
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      toast({
        title: 'Disconnect Failed',
        description: 'Failed to disconnect wallet',
        type: 'error',
      });
    }
  }, [disconnect, toast]);

  return { disconnectWallet, isConnected: connected };
}

export function useSignMessage() {
  const { signMessage, publicKey, connected } = useWallet();
  const { error: showError } = useToastStore();

  const sign = useCallback(
    async (message: string): Promise<Uint8Array | null> => {
      if (!connected || !publicKey || !signMessage) {
        showError({
          title: 'Signing Error',
          description: 'Wallet not connected',
          type: 'error',
        });
        return null;
      }

      try {
        const messageBuffer = new TextEncoder().encode(message);
        const signature = await signMessage(messageBuffer);
        return signature;
      } catch (err) {
        console.error('Error signing message:', err);
        showError({
          title: 'Signing Failed',
          description: 'Failed to sign message',
          type: 'error',
        });
        return null;
      }
    },
    [connected, publicKey, signMessage, showError]
  );

  return { sign, canSign: connected && !!signMessage };
}
