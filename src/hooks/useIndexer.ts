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

export interface AddressUTXO {
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
      return data.map((utxo: { 
        txid: string; 
        vout: number; 
        value: number; 
        status?: { 
          confirmed?: boolean; 
          block_height?: number; 
          block_hash?: string;
          block_time?: number;
        } 
      }) => ({
        txid: utxo.txid,
        vout: utxo.vout,
        value: utxo.value,
        height: utxo.status?.block_height || 0,
        confirmations: utxo.status?.confirmed ? 1 : 0, // Mempool API doesn't return confirmations directly
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

export interface AddressUTXOWithAddress extends AddressUTXO {
  address: string; // The address that owns this UTXO
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
      
      const allUtxos: AddressUTXOWithAddress[] = [];
      
      console.log('Fetching UTXOs for addresses:', addresses);
      
      for (const address of addresses) {
        try {
          const utxos = await fetchAddressUTXOs(
            address, 
            config.network,
            config.indexers?.map(i => i.url)
          );
          
          // Add address info to each UTXO
          const utxosWithAddress = utxos.map(utxo => ({
            ...utxo,
            address,
          }));
          
          console.log(`Fetched ${utxos.length} UTXOs for ${address}:`, utxosWithAddress);
          
          allUtxos.push(...utxosWithAddress);
        } catch (error) {
          console.error(`Failed to fetch UTXOs for ${address}:`, error);
        }
      }
      
      console.log(`Total UTXOs fetched: ${allUtxos.length}`);
      
      return allUtxos;
    },
    enabled: addresses.length > 0,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
