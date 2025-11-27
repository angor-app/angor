/**
 * Network-specific configuration for Angor
 */

export interface NetworkConfig {
  indexers: string[];
  explorers: string[];
  relays: string[];
}

export const NETWORK_CONFIG: Record<'mainnet' | 'testnet', NetworkConfig> = {
  mainnet: {
    indexers: [
      'https://fulcrum.angor.online',
      'https://electrs.angor.online',
      'https://cyphermunkhouse.angor.online',
      'https://indexer.angor.fund',
    ],
    explorers: [
      'https://explorer.angor.io',
      'https://fulcrum.angor.online',
      'https://electrs.angor.online',
      'https://cyphermunkhouse.angor.online',
      'https://indexer.angor.fund',
    ],
    relays: [
      'wss://relay.angor.io',
      'wss://relay2.angor.io',
      'wss://relay.damus.io',
      'wss://nos.lol',
      'wss://nostr-01.yakihonne.com',
      'wss://nostr-02.yakihonne.com',
    ],
  },
  testnet: {
    indexers: [
      'https://signet.angor.online',
      'https://signet2.angor.online',
    ],
    explorers: [
      'https://test.explorer.angor.io',
      'https://signet.angor.online',
      'https://signet2.angor.online',
    ],
    relays: [
      'wss://relay.angor.io',
      'wss://relay2.angor.io',
    ],
  },
};

/**
 * Get the default explorer URL for a network
 */
export function getExplorerUrl(network: 'mainnet' | 'testnet'): string {
  return NETWORK_CONFIG[network].explorers[0];
}

/**
 * Get transaction URL for explorer
 */
export function getTxUrl(txid: string, network: 'mainnet' | 'testnet'): string {
  const explorer = getExplorerUrl(network);
  return `${explorer}/tx/${txid}`;
}

/**
 * Get address URL for explorer
 */
export function getAddressUrl(address: string, network: 'mainnet' | 'testnet', customExplorer?: string): string {
  const explorer = customExplorer || getExplorerUrl(network);
  return `${explorer}/address/${address}`;
}
