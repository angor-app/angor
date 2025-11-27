import * as bip39 from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';
import * as btc from 'bitcoinjs-lib';
import { WalletWords, AccountInfo, AddressInfo } from '@/types/angor.types';

export class WalletOperations {
  private networkType: 'mainnet' | 'testnet' | 'regtest';
  private network: btc.Network;

  constructor(networkType: 'mainnet' | 'testnet' | 'regtest' = 'testnet') {
    this.networkType = networkType;
    this.network = networkType === 'mainnet' 
      ? btc.networks.bitcoin 
      : btc.networks.testnet;
  }

  generateWalletWords(): string {
    const mnemonic = bip39.generateMnemonic(englishWordlist, 128);
    return mnemonic;
  }

  validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic, englishWordlist);
  }

  private deriveAddress(hdKey: HDKey, path: string): string {
    const child = hdKey.derive(path);
    const pubkey = child.publicKey;
    
    if (!pubkey) {
      throw new Error('Failed to derive public key');
    }

    // Generate P2WPKH (native segwit) address
    const { address } = btc.payments.p2wpkh({
      pubkey: Buffer.from(pubkey),
      network: this.network,
    });

    if (!address) {
      throw new Error('Failed to generate address');
    }

    return address;
  }

  generateAccountInfo(
    walletWords: WalletWords,
    accountIndex: number = 0,
    receiveCount: number = 20,
    changeCount: number = 20
  ): AccountInfo {
    const seed = bip39.mnemonicToSeedSync(walletWords.words, walletWords.password);
    const hdKey = HDKey.fromMasterSeed(seed);
    
    const coinType = this.networkType === 'mainnet' ? 0 : 1;
    const basePath = `m/84'/${coinType}'/${accountIndex}'`;
    
    const addresses: AddressInfo[] = [];

    // Generate receive addresses
    for (let i = 0; i < receiveCount; i++) {
      const path = `${basePath}/0/${i}`;
      const address = this.deriveAddress(hdKey, path);
      addresses.push({
        address,
        path,
        index: i,
        change: false,
      });
    }

    // Generate change addresses
    for (let i = 0; i < changeCount; i++) {
      const path = `${basePath}/1/${i}`;
      const address = this.deriveAddress(hdKey, path);
      addresses.push({
        address,
        path,
        index: i,
        change: true,
      });
    }

    return {
      accountIndex,
      accountName: `Account ${accountIndex}`,
      addresses,
      receiveIndex: 0,
      changeIndex: 0,
      balance: 0,
    };
  }

  private generateRandomHash(): string {
    const chars = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    let result = '';
    for (let i = 0; i < 38; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
