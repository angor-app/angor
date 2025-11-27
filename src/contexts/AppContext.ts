import { createContext } from "react";

export type Theme = "dark" | "light" | "system";
export type BitcoinNetwork = "mainnet" | "testnet" | "regtest";

export interface ExplorerConfig {
  url: string;
  isDefault: boolean;
}

export interface IndexerConfig {
  url: string;
  status: 'online' | 'offline' | 'unknown';
  isDefault: boolean;
}

export interface NostrRelayConfig {
  url: string;
  name: string;
  status: 'online' | 'offline' | 'unknown';
}

export interface RelayMetadata {
  /** List of relays with read/write permissions */
  relays: { url: string; read: boolean; write: boolean }[];
  /** Unix timestamp of when the relay list was last updated */
  updatedAt: number;
}

export interface AppConfig {
  /** Current theme */
  theme: Theme;
  /** Bitcoin network type */
  network: BitcoinNetwork;
  /** Explorer configurations */
  explorers: ExplorerConfig[];
  /** Indexer configurations */
  indexers: IndexerConfig[];
  /** Nostr relay configurations */
  nostrRelays: NostrRelayConfig[];
  /** NIP-65 relay list metadata */
  relayMetadata: RelayMetadata;
}

export interface AppContextType {
  /** Current application configuration */
  config: AppConfig;
  /** Update configuration using a callback that receives current config and returns new config */
  updateConfig: (updater: (currentConfig: Partial<AppConfig>) => Partial<AppConfig>) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
