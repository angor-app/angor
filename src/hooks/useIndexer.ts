import { useQuery } from '@tanstack/react-query';
import { useAppContext } from './useAppContext';
import { NETWORK_CONFIG } from '@/lib/networkConfig';

interface AddressBalance {
  address: string;
  balance: number; // in satoshis
  totalReceived: number;
  totalSent: number;
  txCount: number;
}

interface AddressUTXO {
  txid: string;
  vout: number;
  value: number; // in satoshis
  height: number;
  confirmations: number;
}

/**
 * Fetch address balance from Electrum-style indexer
 */
async function fetchAddressBalance(
  address: string,
  network: 'mainnet' | 'testnet' | 'regtest',
  configIndexers?: string[]
): Promise<AddressBalance> {
  const indexers = configIndexers && configIndexers.length > 0 
    ? configIndexers 
    : NETWORK_CONFIG[network].indexers;
  
  for (const indexer of indexers) {
    try {
      const response = await fetch(`${indexer}/api/address/${address}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        continue; // Try next indexer
      }

      const data = await response.json();
      
      const funded = data.chain_stats?.funded_txo_sum || 0;
      const spent = data.chain_stats?.spent_txo_sum || 0;
      
      return {
        address,
        balance: funded - spent,
        totalReceived: funded,
        totalSent: spent,
        txCount: data.chain_stats?.tx_count || 0,
      };
    } catch (error) {
      console.warn(`Failed to fetch from ${indexer}:`, error);
      continue; // Try next indexer
    }
  }

  throw new Error('All indexers failed');
}

/**
 * Fetch UTXOs for an address
 */
async function fetchAddressUTXOs(
  address: string,
  network: 'mainnet' | 'testnet' | 'regtest',
  configIndexers?: string[]
): Promise<AddressUTXO[]> {
  const indexers = configIndexers && configIndexers.length > 0 
    ? configIndexers 
    : NETWORK_CONFIG[network].indexers;
  
  for (const indexer of indexers) {
    try {
      const response = await fetch(`${indexer}/api/address/${address}/utxo`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      return data.map((utxo: { txid: string; vout: number; value: number; status?: { block_height?: number; confirmed?: boolean; confirmations?: number } }) => ({
        txid: utxo.txid,
        vout: utxo.vout,
        value: utxo.value,
        height: utxo.status?.block_height || 0,
        confirmations: utxo.status?.confirmed ? utxo.status.confirmations || 0 : 0,
      }));
    } catch (error) {
      console.warn(`Failed to fetch UTXOs from ${indexer}:`, error);
      continue;
    }
  }

  throw new Error('All indexers failed');
}

/**
 * Hook to fetch balance for a single address
 */
export function useAddressBalance(address: string | undefined) {
  const { config } = useAppContext();

  return useQuery({
    queryKey: ['address-balance', address, config.network],
    queryFn: async () => {
      if (!address) throw new Error('No address provided');
      return fetchAddressBalance(address, config.network);
    },
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Hook to fetch balance for multiple addresses
 */
export function useAddressesBalance(addresses: string[]) {
  const { config } = useAppContext();
  const configIndexers = config.indexers?.map(i => i.url) || [];

  return useQuery({
    queryKey: ['addresses-balance', addresses, config.network, configIndexers],
    queryFn: async () => {
      if (!addresses.length) return { totalBalance: 0, addresses: [] };

      const results = await Promise.allSettled(
        addresses.map((addr) => fetchAddressBalance(addr, config.network, configIndexers))
      );

      const balances: AddressBalance[] = [];
      let totalBalance = 0;

      for (const result of results) {
        if (result.status === 'fulfilled') {
          balances.push(result.value);
          totalBalance += result.value.balance;
        }
      }

      return {
        totalBalance, // in satoshis
        totalBalanceBTC: totalBalance / 100000000, // in BTC
        addresses: balances,
      };
    },
    enabled: addresses.length > 0,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Hook to fetch UTXOs for multiple addresses
 */
export function useAddressUTXOs(addresses: string[]) {
  const { config } = useAppContext();

  return useQuery({
    queryKey: ['addresses-utxos', addresses, config.network],
    queryFn: async () => {
      if (!addresses || addresses.length === 0) return [];
      
      const allUtxos: AddressUTXO[] = [];
      
      for (const address of addresses) {
        try {
          const utxos = await fetchAddressUTXOs(
            address, 
            config.network,
            config.indexers?.map(i => i.url)
          );
          allUtxos.push(...utxos);
        } catch (error) {
          console.error(`Failed to fetch UTXOs for ${address}:`, error);
        }
      }
      
      return allUtxos;
    },
    enabled: addresses.length > 0,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
