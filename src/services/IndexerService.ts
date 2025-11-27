import { NetworkConfig, UtxoData, FeeEstimate } from '@/types/angor.types';
import { DEFAULT_NETWORK } from '@/config/networks';

export class IndexerService {
  private config: NetworkConfig;

  constructor(config: NetworkConfig = DEFAULT_NETWORK) {
    this.config = config;
  }

  async getAddressUtxos(address: string): Promise<UtxoData[]> {
    try {
      const response = await fetch(
        `${this.config.indexerUrl}/query/address/${address}/utxos`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.map((utxo: Record<string, unknown>) => ({
        outpoint: {
          transactionId: utxo.txId,
          outputIndex: utxo.outputIndex,
        },
        value: utxo.value,
        address,
        scriptPubKey: utxo.scriptPubKey,
        confirmations: utxo.confirmations || 0,
      }));
    } catch (error) {
      console.error('Error fetching UTXOs:', error);
      return [];
    }
  }

  async getAddressBalance(address: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.config.indexerUrl}/query/address/${address}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }

      const data = await response.json();
      return data.balance || 0;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }

  async getTransaction(txId: string): Promise<unknown> {
    try {
      const response = await fetch(
        `${this.config.indexerUrl}/query/transaction/${txId}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  async broadcastTransaction(txHex: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.config.indexerUrl}/send/transaction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hex: txHex }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to broadcast transaction: ${response.statusText}`);
      }

      const data = await response.json();
      return data.txId || data.txid || '';
    } catch (error) {
      console.error('Error broadcasting transaction:', error);
      throw error;
    }
  }

  async getFeeEstimates(): Promise<FeeEstimate> {
    try {
      const response = await fetch(`${this.config.mempoolUrl}/v1/fees/recommended`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch fee estimates: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        fastestFee: data.fastestFee || 10,
        halfHourFee: data.halfHourFee || 8,
        hourFee: data.hourFee || 6,
        economyFee: data.economyFee || 4,
        minimumFee: data.minimumFee || 1,
      };
    } catch (error) {
      console.error('Error fetching fee estimates:', error);
      return {
        fastestFee: 10,
        halfHourFee: 8,
        hourFee: 6,
        economyFee: 4,
        minimumFee: 1,
      };
    }
  }

  async getBlockHeight(): Promise<number> {
    try {
      const response = await fetch(`${this.config.mempoolUrl}/blocks/tip/height`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch block height: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching block height:', error);
      return 0;
    }
  }
}
