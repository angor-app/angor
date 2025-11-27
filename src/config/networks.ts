import { NetworkConfig } from '@/types/angor.types';

export const NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    network: 'mainnet',
    indexerUrl: 'https://btc.indexer.blockcore.net/api',
    mempoolUrl: 'https://mempool.space/api',
  },
  testnet: {
    network: 'testnet',
    indexerUrl: 'https://btc.indexer.blockcore.net/api',
    mempoolUrl: 'https://mempool.space/testnet/api',
  },
};

export const DEFAULT_NETWORK: NetworkConfig = NETWORKS.testnet;

export const ANGOR_FEE_ADDRESS = {
  mainnet: 'bc1qangorfeesaddress',
  testnet: 'tb1qangorfeesaddress',
};

export const ANGOR_ROOT_KEY = 'angor-root';

export const BIP84_PURPOSE = 84;
export const BIP84_COIN_TYPE_MAINNET = 0;
export const BIP84_COIN_TYPE_TESTNET = 1;

export const SATOSHI_PER_BTC = 100_000_000;

export const DEFAULT_FEE_RATE = 10;
