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
  network: 'mainnet' | 'testnet',
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
 * Mempool API response types
 */
interface MempoolVout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address?: string;
  value: number;
}

interface MempoolStatus {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

interface MempoolTransaction {
  txid: string;
  version: number;
  locktime: number;
  vin: unknown[];
  vout: MempoolVout[];
  size: number;
  weight: number;
  fee: number;
  status: MempoolStatus;
}

interface MempoolOutspend {
  spent: boolean;
  txid?: string;
  vin?: number;
  status?: MempoolStatus;
}

/**
 * Fetch UTXOs for an address
 * Implementation follows Mempool Space API pattern:
 * 1. GET /address/{address}/txs - Get all transactions
 * 2. For each tx output matching address, GET /tx/{txid}/outspends
 * 3. Filter for unspent outputs
 */
async function fetchAddressUTXOs(
  address: string,
  network: 'mainnet' | 'testnet',
  configIndexers?: string[]
): Promise<AddressUTXO[]> {
  const indexers = configIndexers && configIndexers.length > 0 
    ? configIndexers 
    : NETWORK_CONFIG[network].indexers;
  
  for (const indexer of indexers) {
    try {
      // Step 1: Fetch all transactions for the address (limit to last 50)
      const txsUrl = `${indexer}/api/address/${address}/txs`;
      
      const txsResponse = await fetch(txsUrl, {
        signal: AbortSignal.timeout(10000),
      });

      if (!txsResponse.ok) {
        continue;
      }

      const allTransactions: MempoolTransaction[] = await txsResponse.json();
      // Limit to recent transactions to avoid hanging
      const transactions = allTransactions.slice(0, 50);
      
      const utxos: AddressUTXO[] = [];

      // Step 2: Process each transaction
      for (const tx of transactions) {
        // Check each output (vout) in the transaction
        for (let voutIndex = 0; voutIndex < tx.vout.length; voutIndex++) {
          const vout = tx.vout[voutIndex];
          
          // Skip if output doesn't match our address
          if (vout.scriptpubkey_address !== address) {
            continue;
          }

          // Step 3: Check if this output is spent
          const outspendsUrl = `${indexer}/api/tx/${tx.txid}/outspends`;
          const outspendsResponse = await fetch(outspendsUrl, {
            signal: AbortSignal.timeout(5000),
          });

          if (!outspendsResponse.ok) {
            continue;
          }

          const outspends: MempoolOutspend[] = await outspendsResponse.json();
          
          // Check if this specific output is unspent
          if (voutIndex < outspends.length && !outspends[voutIndex].spent) {
            utxos.push({
              txid: tx.txid,
              vout: voutIndex,
              value: vout.value,
              height: tx.status.block_height || 0,
              confirmations: tx.status.confirmed ? 1 : 0,
            });
          }
        }
      }

      return utxos;
    } catch {
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
          
          allUtxos.push(...utxosWithAddress);
        } catch {
          // Silently continue to next address
        }
      }
      
      return allUtxos;
    },
    enabled: addresses.length > 0,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
