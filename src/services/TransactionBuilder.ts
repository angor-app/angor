import * as btc from 'bitcoinjs-lib';
import * as bip39 from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { AddressUTXO } from '@/hooks/useIndexer';

// Initialize ECC library
let eccInitialized = false;
function initEcc() {
  if (!eccInitialized) {
    btc.initEccLib(ecc);
    eccInitialized = true;
  }
}

interface TransactionInput {
  utxo: AddressUTXO;
  address: string;
  path: string;
}

interface BuildTransactionParams {
  mnemonic: string;
  recipientAddress: string;
  amountSats: number;
  feeRate: number; // sat/vB
  utxos: TransactionInput[];
  changeAddress: string;
  network: 'mainnet' | 'testnet';
}

interface BuildTransactionResult {
  txHex: string;
  txId: string;
  fee: number;
  size: number;
}

export class TransactionBuilder {
  private network: btc.Network;

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network === 'mainnet' 
      ? btc.networks.bitcoin 
      : btc.networks.testnet;
  }

  /**
   * Build and sign a Bitcoin transaction
   */
  async buildTransaction(params: BuildTransactionParams): Promise<BuildTransactionResult> {
    // Initialize ECC library
    initEcc();
    const ECPair = ECPairFactory(ecc);

    const {
      mnemonic,
      recipientAddress,
      amountSats,
      feeRate,
      utxos,
      changeAddress,
    } = params;

    // Validate mnemonic
    if (!bip39.validateMnemonic(mnemonic, englishWordlist)) {
      throw new Error('Invalid mnemonic');
    }

    console.log('TransactionBuilder: Starting transaction build', {
      recipientAddress,
      amountSats,
      feeRate,
      utxoCount: utxos.length,
      network: params.network,
    });

    // Derive master key from mnemonic
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const masterKey = HDKey.fromMasterSeed(seed);

    // Create transaction builder
    const psbt = new btc.Psbt({ network: this.network });

    // Select UTXOs and add inputs
    const selectedUtxos: TransactionInput[] = [];
    let totalInput = 0;

    // Sort UTXOs by value (largest first) for optimal selection
    const sortedUtxos = [...utxos].sort((a, b) => b.utxo.value - a.utxo.value);

    for (const input of sortedUtxos) {
      if (totalInput >= amountSats + this.estimateFee(selectedUtxos.length + 1, 2, feeRate)) {
        break;
      }

      selectedUtxos.push(input);
      totalInput += input.utxo.value;
    }

    // Check if we have enough funds
    const estimatedFee = this.estimateFee(selectedUtxos.length, 2, feeRate);
    
    console.log('TransactionBuilder: UTXO selection complete', {
      selectedCount: selectedUtxos.length,
      totalInput,
      amountSats,
      estimatedFee,
      total: amountSats + estimatedFee,
    });
    
    if (totalInput < amountSats + estimatedFee) {
      throw new Error(`Insufficient funds. Need ${amountSats + estimatedFee} sats, have ${totalInput} sats`);
    }

    // Add inputs to PSBT
    for (const input of selectedUtxos) {
      // Derive the key pair for this input
      const childKey = masterKey.derive(input.path);
      if (!childKey.privateKey) {
        throw new Error('Failed to derive private key');
      }

      const keyPair = ECPair.fromPrivateKey(Buffer.from(childKey.privateKey), {
        network: this.network,
      });

      // Get the P2WPKH payment object
      const p2wpkh = btc.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: this.network,
      });

      psbt.addInput({
        hash: input.utxo.txid,
        index: input.utxo.vout,
        witnessUtxo: {
          script: p2wpkh.output!,
          value: BigInt(input.utxo.value),
        },
      });
    }

    // Add output to recipient
    psbt.addOutput({
      address: recipientAddress,
      value: BigInt(amountSats),
    });

    // Calculate change
    const actualFee = this.estimateFee(selectedUtxos.length, 2, feeRate);
    const change = totalInput - amountSats - actualFee;

    // Add change output if significant (> dust limit of 546 sats)
    if (change > 546) {
      psbt.addOutput({
        address: changeAddress,
        value: BigInt(change),
      });
    } else if (change < 0) {
      throw new Error('Insufficient funds for transaction fee');
    }

    // Sign all inputs
    for (let i = 0; i < selectedUtxos.length; i++) {
      const input = selectedUtxos[i];
      const childKey = masterKey.derive(input.path);
      
      if (!childKey.privateKey) {
        throw new Error('Failed to derive private key');
      }

      const keyPair = ECPair.fromPrivateKey(Buffer.from(childKey.privateKey), {
        network: this.network,
      });

      psbt.signInput(i, keyPair);
    }

    console.log('TransactionBuilder: All inputs signed, finalizing...');
    
    // Finalize all inputs
    psbt.finalizeAllInputs();

    console.log('TransactionBuilder: Extracting transaction...');
    
    // Extract transaction
    const tx = psbt.extractTransaction();
    const txHex = tx.toHex();
    const txId = tx.getId();
    const size = tx.virtualSize();

    console.log('TransactionBuilder: Transaction built successfully', {
      txId,
      size,
      fee: actualFee,
      hexLength: txHex.length,
    });

    return {
      txHex,
      txId,
      fee: actualFee,
      size,
    };
  }

  /**
   * Estimate transaction fee
   */
  private estimateFee(inputCount: number, outputCount: number, feeRate: number): number {
    // P2WPKH input: ~68 vBytes
    // P2WPKH output: ~31 vBytes
    // Overhead: ~10.5 vBytes
    const estimatedSize = inputCount * 68 + outputCount * 31 + 10.5;
    return Math.ceil(estimatedSize * feeRate);
  }

  /**
   * Fetch transaction hex from indexer
   */
  private async fetchTransactionHex(_txid: string, _network: 'mainnet' | 'testnet'): Promise<string> {
    // This is a placeholder - you'll need to implement actual fetching from your indexers
    // For now, we'll use the witness UTXO approach which doesn't require the full tx
    return '';
  }

  /**
   * Broadcast transaction to the network
   */
  async broadcastTransaction(txHex: string, indexers: string[]): Promise<string> {
    for (const indexer of indexers) {
      try {
        const response = await fetch(`${indexer}/api/tx`, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: txHex,
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }

        const txid = await response.text();
        return txid;
      } catch (error) {
        console.warn(`Failed to broadcast to ${indexer}:`, error);
        continue;
      }
    }

    throw new Error('Failed to broadcast transaction to all indexers');
  }
}
