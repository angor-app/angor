import type { AppConfig } from '@/contexts/AppContext';

/**
 * Default configuration for mainnet
 */
export const MAINNET_CONFIG: Omit<AppConfig, 'theme' | 'relayMetadata'> = {
  network: 'mainnet',
  explorers: [
    { url: 'https://explorer.angor.io', isDefault: true },
    { url: 'https://fulcrum.angor.online', isDefault: false },
    { url: 'https://electrs.angor.online', isDefault: false },
    { url: 'https://cyphermunkhouse.angor.online', isDefault: false },
    { url: 'https://indexer.angor.fund', isDefault: false },
  ],
  indexers: [
    { url: 'https://fulcrum.angor.online', status: 'unknown', isDefault: true },
    { url: 'https://electrs.angor.online', status: 'unknown', isDefault: false },
    { url: 'https://cyphermunkhouse.angor.online', status: 'unknown', isDefault: false },
    { url: 'https://indexer.angor.fund', status: 'unknown', isDefault: false },
  ],
  nostrRelays: [
    { url: 'wss://relay.angor.io', name: 'strfry default', status: 'unknown' },
    { url: 'wss://relay2.angor.io', name: 'strfry2 default', status: 'unknown' },
    { url: 'wss://relay.damus.io', name: 'damus.io', status: 'unknown' },
    { url: 'wss://nos.lol', name: 'nos.lol', status: 'unknown' },
    { url: 'wss://nostr-01.yakihonne.com', name: 'YakiHonne strfry relay-0', status: 'unknown' },
    { url: 'wss://nostr-02.yakihonne.com', name: 'YakiHonne strfry relay-1', status: 'unknown' },
  ],
};

/**
 * Default configuration for testnet (Signet/Angornet)
 */
export const TESTNET_CONFIG: Omit<AppConfig, 'theme' | 'relayMetadata'> = {
  network: 'testnet',
  explorers: [
    { url: 'https://test.explorer.angor.io', isDefault: false },
    { url: 'https://signet.angor.online', isDefault: true },
    { url: 'https://signet2.angor.online', isDefault: false },
  ],
  indexers: [
    { url: 'https://test.indexer.angor.io', status: 'unknown', isDefault: false },
    { url: 'https://signet.angor.online', status: 'unknown', isDefault: true },
    { url: 'https://signet2.angor.online', status: 'unknown', isDefault: false },
  ],
  nostrRelays: [
    { url: 'wss://relay.angor.io', name: 'strfry default', status: 'unknown' },
    { url: 'wss://relay2.angor.io', name: 'strfry2 default', status: 'unknown' },
  ],
};

/**
 * Default configuration for regtest
 */
export const REGTEST_CONFIG: Omit<AppConfig, 'theme' | 'relayMetadata'> = {
  network: 'regtest',
  explorers: [
    { url: 'http://localhost:3000', isDefault: true },
  ],
  indexers: [
    { url: 'http://localhost:3000', status: 'unknown', isDefault: true },
  ],
  nostrRelays: [
    { url: 'ws://localhost:7777', name: 'local relay', status: 'unknown' },
  ],
};

/**
 * Get default config for a specific network
 */
export function getDefaultNetworkConfig(network: 'mainnet' | 'testnet' | 'regtest') {
  switch (network) {
    case 'mainnet':
      return MAINNET_CONFIG;
    case 'testnet':
      return TESTNET_CONFIG;
    case 'regtest':
      return REGTEST_CONFIG;
  }
}
