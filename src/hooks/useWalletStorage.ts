import { useState, useEffect } from 'react';
import { useCurrentUser } from './useCurrentUser';

export interface WalletData {
  mnemonic: string; // encrypted
  createdAt: number;
  lastUsed: number;
  accountIndex: number;
}

export function useWalletStorage() {
  const { user } = useCurrentUser();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = user ? `angor:wallet:${user.pubkey}` : null;

  useEffect(() => {
    if (!storageKey) {
      setWallet(null);
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setWallet(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  const saveWallet = async (mnemonic: string, accountIndex: number = 0) => {
    if (!storageKey || !user) return;

    try {
      // Encrypt mnemonic with user's Nostr key
      const encrypted = await user.signer.nip44!.encrypt(user.pubkey, mnemonic);

      const walletData: WalletData = {
        mnemonic: encrypted,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        accountIndex,
      };

      localStorage.setItem(storageKey, JSON.stringify(walletData));
      setWallet(walletData);
      return true;
    } catch (error) {
      console.error('Failed to save wallet:', error);
      return false;
    }
  };

  const loadMnemonic = async (): Promise<string | null> => {
    if (!wallet || !user) return null;

    try {
      const decrypted = await user.signer.nip44!.decrypt(user.pubkey, wallet.mnemonic);
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt mnemonic:', error);
      return null;
    }
  };

  const deleteWallet = () => {
    if (!storageKey) return;
    localStorage.removeItem(storageKey);
    setWallet(null);
  };

  const updateLastUsed = () => {
    if (!wallet || !storageKey) return;
    const updated = { ...wallet, lastUsed: Date.now() };
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setWallet(updated);
  };

  return {
    wallet,
    isLoading,
    hasWallet: !!wallet,
    saveWallet,
    loadMnemonic,
    deleteWallet,
    updateLastUsed,
  };
}
