import * as bip39 from 'bip39';
import { WalletWords, AccountInfo, AddressInfo } from '@/types/angor.types';

export class WalletOperations {
  private networkType: 'mainnet' | 'testnet' | 'regtest';

  constructor(networkType: 'mainnet' | 'testnet' | 'regtest' = 'testnet') {
    this.networkType = networkType;
  }

  generateWalletWords(): string {
    const mnemonic = bip39.generateMnemonic(128);
    return mnemonic;
  }

  validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  generateAccountInfo(
    walletWords: WalletWords,
    accountIndex: number = 0,
    receiveCount: number = 20,
    changeCount: number = 20
  ): AccountInfo {
    const addresses: AddressInfo[] = [];

    for (let i = 0; i < receiveCount; i++) {
      addresses.push({
        address: `${this.networkType === 'mainnet' ? 'bc1' : 'tb1'}q${this.generateRandomHash()}`,
        path: `m/84'/${this.networkType === 'mainnet' ? 0 : 1}'/${accountIndex}'/0/${i}`,
        index: i,
        change: false,
      });
    }

    for (let i = 0; i < changeCount; i++) {
      addresses.push({
        address: `${this.networkType === 'mainnet' ? 'bc1' : 'tb1'}q${this.generateRandomHash()}`,
        path: `m/84'/${this.networkType === 'mainnet' ? 0 : 1}'/${accountIndex}'/1/${i}`,
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
