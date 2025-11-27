# Angor Technology Implementation Guide for React

## Table of Contents
1. [Introduction to Angor](#introduction-to-angor)
2. [Core Architecture](#core-architecture)
3. [Technology Stack](#technology-stack)
4. [React Implementation Strategy](#react-implementation-strategy)
5. [Core Components and Services](#core-components-and-services)
6. [Bitcoin Integration](#bitcoin-integration)
7. [Nostr Integration](#nostr-integration)
8. [State Management](#state-management)
9. [Security Considerations](#security-considerations)
10. [Project Structure](#project-structure)
11. [Implementation Steps](#implementation-steps)

---

## Introduction to Angor

Angor is a **fully decentralized Bitcoin funding protocol** with two unique characteristics:

1. **Complete Decentralization**: No backend servers - uses Bitcoin blockchain for transactions and Nostr for decentralized storage
2. **Time-locked Fund Release**: Bitcoin is released to founders in predetermined stages, allowing investors to recover unspent funds at any time

### Key Features
- Bitcoin Taproot-based smart contracts
- Nostr protocol for project metadata and messaging
- HD wallet support (BIP32/BIP39/BIP84)
- Multi-stage funding with time locks
- Investor protection through recovery mechanisms
- Seeder-based threshold signatures for additional security

---

## Core Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                            │
│  ├── Browse Projects                                         │
│  ├── Create Project (Founder)                                │
│  ├── Invest in Project (Investor)                            │
│  ├── Recover Funds                                           │
│  └── Wallet Management                                       │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                              │
│  ├── Wallet Operations                                       │
│  ├── Transaction Building (Taproot)                          │
│  ├── Nostr Communication                                     │
│  ├── Indexer Service                                         │
│  └── Encryption Service                                      │
├─────────────────────────────────────────────────────────────┤
│  State Management (Redux/Zustand/Context)                    │
│  ├── Wallet State                                            │
│  ├── Project State                                           │
│  ├── Network State                                           │
│  └── UI State                                                │
├─────────────────────────────────────────────────────────────┤
│  Bitcoin/Nostr Libraries                                     │
│  ├── bitcoinjs-lib (Transaction Building)                    │
│  ├── nostr-tools (Nostr Protocol)                            │
│  ├── bip39 (Mnemonic)                                        │
│  └── bip32 (HD Wallets)                                      │
└─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│ Bitcoin Network  │          │  Nostr Relays    │
│ (via Indexer)    │          │                  │
└──────────────────┘          └──────────────────┘
```

---

## Technology Stack

### Required JavaScript/TypeScript Libraries

```json
{
  "dependencies": {
    // React Core
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0",
    
    // Bitcoin Libraries
    "bitcoinjs-lib": "^6.1.0",
    "bip32": "^4.0.0",
    "bip39": "^3.1.0",
    "ecpair": "^2.1.0",
    "tiny-secp256k1": "^2.2.3",
    
    // Nostr
    "nostr-tools": "^1.17.0",
    
    // Crypto
    "crypto-js": "^4.2.0",
    
    // HTTP
    "axios": "^1.6.0",
    
    // State Management (choose one)
    "zustand": "^4.4.0",
    // or
    "redux": "^4.2.0",
    "@reduxjs/toolkit": "^1.9.0",
    
    // Storage
    "localforage": "^1.10.0",
    
    // UI Components
    "react-qr-code": "^2.0.12",
    "qrcode.react": "^3.1.0",
    
    // Utils
    "date-fns": "^2.30.0",
    "decimal.js": "^10.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "vite": "^5.0.0"
  }
}
```

---

## React Implementation Strategy

### 1. Project Setup

```bash
# Create React + TypeScript project
npm create vite@latest angor-react -- --template react-ts
cd angor-react
npm install

# Install Bitcoin dependencies
npm install bitcoinjs-lib bip32 bip39 ecpair tiny-secp256k1

# Install Nostr
npm install nostr-tools

# Install crypto and storage
npm install crypto-js localforage

# Install state management (example with Zustand)
npm install zustand

# Install UI utilities
npm install react-qr-code qrcode.react date-fns decimal.js axios
```

### 2. Environment Configuration

Create `.env` file:

```env
# Network Configuration
VITE_NETWORK=testnet
VITE_BITCOIN_NETWORK=testnet

# Indexer URLs
VITE_INDEXER_URL=https://btc.indexer.blockcore.net/api
VITE_MEMPOOL_API_URL=https://mempool.space/testnet/api

# Nostr Relay URLs
VITE_NOSTR_RELAYS=wss://relay.damus.io,wss://relay.nostr.band,wss://nos.lol

# Angor Specific
VITE_ANGOR_ROOT_KEY=angor-root
VITE_ANGOR_FEE_ADDRESS=tb1qangorfeesaddress
```

---

## Core Components and Services

### Service Architecture

```typescript
// src/types/angor.types.ts
export interface ProjectInfo {
  founderKey: string;
  founderRecoveryKey: string;
  projectIdentifier: string;
  nostrPubKey: string;
  startDate: Date;
  endDate: Date;
  penaltyDays: number;
  expiryDate: Date;
  targetAmount: number;
  penaltyThreshold?: number;
  stages: Stage[];
  projectSeeders?: ProjectSeeders;
}

export interface Stage {
  releaseDate: Date;
  amountToRelease: number;
  index: number;
}

export interface WalletWords {
  words: string;
  password?: string;
}

export interface AccountInfo {
  accountIndex: number;
  accountName: string;
  addresses: AddressInfo[];
  receiveIndex: number;
  changeIndex: number;
  balance: number;
}

export interface AddressInfo {
  address: string;
  path: string;
  index: number;
  change: boolean;
}

export interface ProjectMetadata {
  name: string;
  displayName: string;
  about: string;
  website: string;
  picture: string;
  banner?: string;
}

export interface UtxoData {
  outpoint: {
    transactionId: string;
    outputIndex: number;
  };
  value: number;
  address: string;
  scriptPubKey: string;
  confirmations: number;
}

export interface TransactionInfo {
  transaction: any; // Bitcoin transaction object
  transactionFee: number;
}

export interface SignatureInfo {
  projectIdentifier: string;
  signatures: string[];
}
```

---

## Bitcoin Integration

### 1. Wallet Operations Service

```typescript
// src/services/WalletOperations.ts
import * as bip39 from 'bip39';
import { BIP32Factory, BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';

const bip32 = BIP32Factory(ecc);

export class WalletOperations {
  private network: bitcoin.Network;

  constructor(networkType: 'mainnet' | 'testnet' = 'testnet') {
    this.network = networkType === 'mainnet' 
      ? bitcoin.networks.bitcoin 
      : bitcoin.networks.testnet;
  }

  // Generate 12-word mnemonic
  generateWalletWords(): string {
    const mnemonic = bip39.generateMnemonic(128); // 12 words
    return mnemonic;
  }

  // Validate mnemonic
  validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  // Derive master key from mnemonic
  deriveMasterKey(walletWords: WalletWords): BIP32Interface {
    const seed = bip39.mnemonicToSeedSync(
      walletWords.words, 
      walletWords.password || ''
    );
    return bip32.fromSeed(seed, this.network);
  }

  // Derive account (BIP84 - Native SegWit)
  deriveAccount(walletWords: WalletWords, accountIndex: number = 0): BIP32Interface {
    const master = this.deriveMasterKey(walletWords);
    const purpose = 84; // BIP84 for Native SegWit
    const coinType = this.network === bitcoin.networks.bitcoin ? 0 : 1;
    
    // m/84'/0'/0' (or m/84'/1'/0' for testnet)
    return master
      .deriveHardened(purpose)
      .deriveHardened(coinType)
      .deriveHardened(accountIndex);
  }

  // Derive address
  deriveAddress(
    walletWords: WalletWords, 
    accountIndex: number, 
    change: boolean, 
    addressIndex: number
  ): { address: string; path: string; publicKey: string } {
    const account = this.deriveAccount(walletWords, accountIndex);
    const changeIndex = change ? 1 : 0;
    const node = account.derive(changeIndex).derive(addressIndex);

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: node.publicKey,
      network: this.network,
    });

    if (!address) throw new Error('Failed to derive address');

    const purpose = 84;
    const coinType = this.network === bitcoin.networks.bitcoin ? 0 : 1;
    const path = `m/${purpose}'/${coinType}'/${accountIndex}'/${changeIndex}/${addressIndex}`;

    return {
      address,
      path,
      publicKey: node.publicKey.toString('hex'),
    };
  }

  // Generate account info with addresses
  generateAccountInfo(
    walletWords: WalletWords,
    accountIndex: number = 0,
    receiveCount: number = 20,
    changeCount: number = 20
  ): AccountInfo {
    const addresses: AddressInfo[] = [];

    // Generate receive addresses
    for (let i = 0; i < receiveCount; i++) {
      const { address, path } = this.deriveAddress(walletWords, accountIndex, false, i);
      addresses.push({
        address,
        path,
        index: i,
        change: false,
      });
    }

    // Generate change addresses
    for (let i = 0; i < changeCount; i++) {
      const { address, path } = this.deriveAddress(walletWords, accountIndex, true, i);
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

  // Sign transaction
  signTransaction(
    walletWords: WalletWords,
    psbt: bitcoin.Psbt,
    paths: string[]
  ): bitcoin.Psbt {
    const master = this.deriveMasterKey(walletWords);

    paths.forEach((path, index) => {
      const pathArray = this.parsePath(path);
      let node = master;
      
      pathArray.forEach((p) => {
        if (p.hardened) {
          node = node.deriveHardened(p.index);
        } else {
          node = node.derive(p.index);
        }
      });

      psbt.signInput(index, {
        publicKey: node.publicKey,
        sign: (hash: Buffer) => node.sign(hash),
      });
    });

    return psbt;
  }

  private parsePath(path: string): Array<{ index: number; hardened: boolean }> {
    return path
      .split('/')
      .slice(1) // Remove 'm'
      .map((p) => ({
        index: parseInt(p.replace("'", '')),
        hardened: p.includes("'"),
      }));
  }
}
```

### 2. Transaction Building Service

```typescript
// src/services/TransactionBuilder.ts
import * as bitcoin from 'bitcoinjs-lib';
import { WalletOperations } from './WalletOperations';

export class TransactionBuilder {
  private walletOps: WalletOperations;
  private network: bitcoin.Network;

  constructor(networkType: 'mainnet' | 'testnet' = 'testnet') {
    this.walletOps = new WalletOperations(networkType);
    this.network = networkType === 'mainnet' 
      ? bitcoin.networks.bitcoin 
      : bitcoin.networks.testnet;
  }

  // Create basic send transaction
  createSendTransaction(
    utxos: UtxoData[],
    outputs: Array<{ address: string; amount: number }>,
    changeAddress: string,
    feeRate: number
  ): bitcoin.Psbt {
    const psbt = new bitcoin.Psbt({ network: this.network });

    // Add inputs
    let totalInput = 0;
    utxos.forEach((utxo) => {
      psbt.addInput({
        hash: utxo.outpoint.transactionId,
        index: utxo.outpoint.outputIndex,
        witnessUtxo: {
          script: Buffer.from(utxo.scriptPubKey, 'hex'),
          value: utxo.value,
        },
      });
      totalInput += utxo.value;
    });

    // Add outputs
    let totalOutput = 0;
    outputs.forEach((output) => {
      psbt.addOutput({
        address: output.address,
        value: output.amount,
      });
      totalOutput += output.amount;
    });

    // Calculate fee
    const estimatedSize = this.estimateTransactionSize(utxos.length, outputs.length + 1);
    const fee = Math.ceil(estimatedSize * feeRate);

    // Add change output
    const change = totalInput - totalOutput - fee;
    if (change > 546) { // Dust threshold
      psbt.addOutput({
        address: changeAddress,
        value: change,
      });
    }

    return psbt;
  }

  // Estimate transaction size in vBytes
  private estimateTransactionSize(inputs: number, outputs: number): number {
    // Base size for SegWit transaction
    const baseSize = 10; // Version + locktime
    const inputSize = 68 * inputs; // Each SegWit input
    const outputSize = 31 * outputs; // Each output
    const witnessSize = 108 * inputs; // Witness data

    const weight = (baseSize + inputSize + outputSize) * 4 + witnessSize;
    return Math.ceil(weight / 4);
  }

  // Finalize and extract transaction
  finalizeTransaction(psbt: bitcoin.Psbt): string {
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    return tx.toHex();
  }
}
```

### 3. Taproot Script Builder (for Angor-specific functionality)

```typescript
// src/services/TaprootScriptBuilder.ts
import * as bitcoin from 'bitcoinjs-lib';
import * as crypto from 'crypto-js';

export class TaprootScriptBuilder {
  private network: bitcoin.Network;

  constructor(networkType: 'mainnet' | 'testnet' = 'testnet') {
    this.network = networkType === 'mainnet' 
      ? bitcoin.networks.bitcoin 
      : bitcoin.networks.testnet;
  }

  // Create unspendable internal key for Taproot
  createUnspendableInternalKey(): Buffer {
    const message = 'Angor Unspendable Taproot Key';
    const hash = crypto.SHA256(message);
    return Buffer.from(hash.toString(), 'hex');
  }

  // Build Taproot script tree for project stages
  buildProjectStageScript(
    founderKey: string,
    investorKey: string,
    releaseDate: Date,
    expiryDate: Date
  ): bitcoin.payments.Payment {
    // Founder can spend after release date
    const founderScript = bitcoin.script.compile([
      bitcoin.opcodes.OP_DUP,
      bitcoin.opcodes.OP_HASH160,
      Buffer.from(founderKey, 'hex'),
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_CHECKSIG,
      bitcoin.script.number.encode(this.dateToLockTime(releaseDate)),
      bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoin.opcodes.OP_DROP,
    ]);

    // Investor can recover after expiry date
    const investorScript = bitcoin.script.compile([
      bitcoin.opcodes.OP_DUP,
      bitcoin.opcodes.OP_HASH160,
      Buffer.from(investorKey, 'hex'),
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_CHECKSIG,
      bitcoin.script.number.encode(this.dateToLockTime(expiryDate)),
      bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoin.opcodes.OP_DROP,
    ]);

    // This is simplified - full Taproot tree implementation requires more complex logic
    // For production, use a proper Taproot library or port the C# implementation

    return bitcoin.payments.p2tr({
      // internalPubkey: this.createUnspendableInternalKey(),
      network: this.network,
    });
  }

  private dateToLockTime(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }
}
```

---

## Nostr Integration

### 1. Nostr Communication Service

```typescript
// src/services/NostrService.ts
import { 
  SimplePool, 
  nip19, 
  nip04,
  getPublicKey,
  generatePrivateKey,
  finishEvent,
  Event as NostrEvent,
  Filter
} from 'nostr-tools';

export class NostrService {
  private pool: SimplePool;
  private relays: string[];

  constructor(relays?: string[]) {
    this.pool = new SimplePool();
    this.relays = relays || [
      'wss://relay.damus.io',
      'wss://relay.nostr.band',
      'wss://nos.lol',
    ];
  }

  // Generate Nostr key pair
  generateKeyPair(): { privateKey: string; publicKey: string; nsec: string; npub: string } {
    const privateKey = generatePrivateKey();
    const publicKey = getPublicKey(privateKey);
    
    return {
      privateKey,
      publicKey,
      nsec: nip19.nsecEncode(privateKey),
      npub: nip19.npubEncode(publicKey),
    };
  }

  // Derive Nostr keys from Bitcoin wallet
  deriveNostrKey(walletWords: WalletWords, founderKey: string): string {
    // This should match the C# implementation in DerivationOperations
    // Simplified version - you need to implement proper derivation
    const combinedData = walletWords.words + founderKey;
    const hash = crypto.SHA256(combinedData);
    return hash.toString();
  }

  // Publish project metadata
  async publishProject(
    privateKey: string,
    projectInfo: ProjectInfo,
    metadata: ProjectMetadata
  ): Promise<string> {
    const content = JSON.stringify({
      projectInfo,
      metadata,
    });

    const event: NostrEvent = {
      kind: 30402, // Custom kind for Angor projects
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['d', projectInfo.projectIdentifier],
        ['title', metadata.name],
      ],
      content,
      pubkey: getPublicKey(privateKey),
    };

    const signedEvent = finishEvent(event, privateKey);
    
    await this.pool.publish(this.relays, signedEvent);
    
    return signedEvent.id;
  }

  // Subscribe to projects by founder pubkey
  subscribeToProjects(
    founderPubKeys: string[],
    onEvent: (event: NostrEvent) => void,
    onEOSE?: () => void
  ): () => void {
    const filter: Filter = {
      kinds: [30402],
      authors: founderPubKeys,
    };

    const sub = this.pool.sub(this.relays, [filter]);

    sub.on('event', onEvent);
    if (onEOSE) {
      sub.on('eose', onEOSE);
    }

    return () => sub.unsub();
  }

  // Fetch project by event ID
  async fetchProjectByEventId(eventId: string): Promise<NostrEvent | null> {
    const filter: Filter = {
      ids: [eventId],
    };

    const events = await this.pool.list(this.relays, [filter]);
    return events[0] || null;
  }

  // Send encrypted direct message
  async sendDirectMessage(
    senderPrivateKey: string,
    recipientPubKey: string,
    message: string
  ): Promise<string> {
    const encryptedContent = await nip04.encrypt(
      senderPrivateKey,
      recipientPubKey,
      message
    );

    const event: NostrEvent = {
      kind: 4, // Direct message
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', recipientPubKey]],
      content: encryptedContent,
      pubkey: getPublicKey(senderPrivateKey),
    };

    const signedEvent = finishEvent(event, senderPrivateKey);
    
    await this.pool.publish(this.relays, signedEvent);
    
    return signedEvent.id;
  }

  // Subscribe to direct messages
  subscribeToDirectMessages(
    pubKey: string,
    onMessage: (event: NostrEvent, decryptedContent: string) => void,
    privateKey: string
  ): () => void {
    const filter: Filter = {
      kinds: [4],
      '#p': [pubKey],
    };

    const sub = this.pool.sub(this.relays, [filter]);

    sub.on('event', async (event: NostrEvent) => {
      try {
        const decrypted = await nip04.decrypt(
          privateKey,
          event.pubkey,
          event.content
        );
        onMessage(event, decrypted);
      } catch (error) {
        console.error('Failed to decrypt message:', error);
      }
    });

    return () => sub.unsub();
  }

  // Update Nostr profile
  async updateProfile(
    privateKey: string,
    metadata: ProjectMetadata
  ): Promise<string> {
    const event: NostrEvent = {
      kind: 0, // Metadata
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify(metadata),
      pubkey: getPublicKey(privateKey),
    };

    const signedEvent = finishEvent(event, privateKey);
    
    await this.pool.publish(this.relays, signedEvent);
    
    return signedEvent.id;
  }

  // Close connections
  close(): void {
    this.pool.close(this.relays);
  }
}
```

---

## State Management

### Using Zustand for State Management

```typescript
// src/stores/walletStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletOperations } from '../services/WalletOperations';

interface WalletState {
  // State
  hasWallet: boolean;
  accountInfo: AccountInfo | null;
  isLocked: boolean;
  network: 'mainnet' | 'testnet';

  // Actions
  createWallet: (mnemonic: string, password?: string) => void;
  unlockWallet: (password: string) => Promise<boolean>;
  lockWallet: () => void;
  setNetwork: (network: 'mainnet' | 'testnet') => void;
  updateBalance: (balance: number) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      hasWallet: false,
      accountInfo: null,
      isLocked: true,
      network: 'testnet',

      createWallet: (mnemonic: string, password?: string) => {
        const walletOps = new WalletOperations(get().network);
        const accountInfo = walletOps.generateAccountInfo(
          { words: mnemonic, password },
          0,
          20,
          20
        );

        set({
          hasWallet: true,
          accountInfo,
          isLocked: false,
        });
      },

      unlockWallet: async (password: string) => {
        // Implement password verification
        set({ isLocked: false });
        return true;
      },

      lockWallet: () => {
        set({ isLocked: true });
      },

      setNetwork: (network: 'mainnet' | 'testnet') => {
        set({ network });
      },

      updateBalance: (balance: number) => {
        set((state) => ({
          accountInfo: state.accountInfo 
            ? { ...state.accountInfo, balance }
            : null,
        }));
      },
    }),
    {
      name: 'angor-wallet-storage',
      partialize: (state) => ({
        hasWallet: state.hasWallet,
        network: state.network,
        // Don't persist sensitive data like accountInfo
      }),
    }
  )
);
```

```typescript
// src/stores/projectStore.ts
import create from 'zustand';

interface ProjectState {
  projects: ProjectInfo[];
  selectedProject: ProjectInfo | null;
  loading: boolean;
  error: string | null;

  // Actions
  addProject: (project: ProjectInfo) => void;
  selectProject: (projectId: string) => void;
  fetchProjects: () => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,

  addProject: (project: ProjectInfo) => {
    set((state) => ({
      projects: [...state.projects, project],
    }));
  },

  selectProject: (projectId: string) => {
    const project = get().projects.find(
      (p) => p.projectIdentifier === projectId
    );
    set({ selectedProject: project || null });
  },

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      // Implement fetching from Nostr
      // const nostrService = new NostrService();
      // const projects = await nostrService.fetchProjects();
      // set({ projects, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));
```

---

## Security Considerations

### 1. Encryption Service

```typescript
// src/services/EncryptionService.ts
import CryptoJS from 'crypto-js';

export class EncryptionService {
  // Encrypt wallet data
  encryptData(data: string, password: string): string {
    return CryptoJS.AES.encrypt(data, password).toString();
  }

  // Decrypt wallet data
  decryptData(encryptedData: string, password: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Hash password for verification
  hashPassword(password: string, salt?: string): string {
    const saltToUse = salt || CryptoJS.lib.WordArray.random(128/8).toString();
    const hash = CryptoJS.PBKDF2(password, saltToUse, {
      keySize: 256/32,
      iterations: 10000,
    });
    return `${saltToUse}:${hash.toString()}`;
  }

  // Verify password
  verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const testHash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000,
    });
    return testHash.toString() === hash;
  }

  // Encrypt Nostr content (NIP-04 compatible)
  async encryptNostrContent(
    senderPrivateKey: string,
    recipientPubKey: string,
    content: string
  ): Promise<string> {
    // Use nostr-tools nip04.encrypt for actual implementation
    // This is a placeholder
    return content;
  }
}
```

### 2. Secure Storage

```typescript
// src/services/SecureStorage.ts
import localforage from 'localforage';
import { EncryptionService } from './EncryptionService';

export class SecureStorage {
  private encryption: EncryptionService;
  private store: LocalForage;

  constructor() {
    this.encryption = new EncryptionService();
    this.store = localforage.createInstance({
      name: 'angor-secure',
    });
  }

  // Store encrypted wallet
  async storeWallet(
    mnemonic: string,
    password: string
  ): Promise<void> {
    const encrypted = this.encryption.encryptData(mnemonic, password);
    const passwordHash = this.encryption.hashPassword(password);
    
    await this.store.setItem('wallet', encrypted);
    await this.store.setItem('passwordHash', passwordHash);
  }

  // Retrieve and decrypt wallet
  async retrieveWallet(password: string): Promise<string | null> {
    const encrypted = await this.store.getItem<string>('wallet');
    const passwordHash = await this.store.getItem<string>('passwordHash');

    if (!encrypted || !passwordHash) {
      return null;
    }

    if (!this.encryption.verifyPassword(password, passwordHash)) {
      throw new Error('Invalid password');
    }

    return this.encryption.decryptData(encrypted, password);
  }

  // Check if wallet exists
  async hasWallet(): Promise<boolean> {
    const wallet = await this.store.getItem('wallet');
    return wallet !== null;
  }

  // Clear all data
  async clearAll(): Promise<void> {
    await this.store.clear();
  }
}
```

---

## Project Structure

```
angor-react/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── QRCode.tsx
│   │   │   └── Notification.tsx
│   │   ├── wallet/
│   │   │   ├── CreateWallet.tsx
│   │   │   ├── ImportWallet.tsx
│   │   │   ├── WalletBalance.tsx
│   │   │   └── AddressDisplay.tsx
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectDetails.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   └── CreateProject.tsx
│   │   ├── investment/
│   │   │   ├── InvestForm.tsx
│   │   │   ├── InvestmentProgress.tsx
│   │   │   └── RecoveryOptions.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Browse.tsx
│   │   ├── Wallet.tsx
│   │   ├── Create.tsx
│   │   ├── Invest.tsx
│   │   ├── Founder.tsx
│   │   ├── Investor.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   ├── WalletOperations.ts
│   │   ├── TransactionBuilder.ts
│   │   ├── TaprootScriptBuilder.ts
│   │   ├── NostrService.ts
│   │   ├── IndexerService.ts
│   │   ├── EncryptionService.ts
│   │   ├── SecureStorage.ts
│   │   └── DerivationOperations.ts
│   ├── stores/
│   │   ├── walletStore.ts
│   │   ├── projectStore.ts
│   │   └── networkStore.ts
│   ├── types/
│   │   ├── angor.types.ts
│   │   ├── bitcoin.types.ts
│   │   └── nostr.types.ts
│   ├── utils/
│   │   ├── bitcoin.utils.ts
│   │   ├── format.utils.ts
│   │   ├── date.utils.ts
│   │   └── validation.utils.ts
│   ├── hooks/
│   │   ├── useWallet.ts
│   │   ├── useProjects.ts
│   │   ├── useNostr.ts
│   │   └── useIndexer.ts
│   ├── config/
│   │   ├── networks.ts
│   │   └── constants.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── routes.tsx
├── .env
├── .env.example
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Implementation Steps

### Phase 1: Core Infrastructure (Week 1-2)

1. **Setup Project**
   ```bash
   npm create vite@latest angor-react -- --template react-ts
   cd angor-react
   npm install
   ```

2. **Install Dependencies**
   - Bitcoin libraries (bitcoinjs-lib, bip32, bip39)
   - Nostr tools
   - State management
   - Storage solutions

3. **Implement Wallet Operations**
   - Mnemonic generation
   - HD wallet derivation
   - Address generation
   - Transaction signing

4. **Implement Storage Layer**
   - Secure storage service
   - Encryption service
   - State persistence

### Phase 2: Bitcoin Integration (Week 3-4)

1. **Indexer Service**
   ```typescript
   // src/services/IndexerService.ts
   import axios from 'axios';
   
   export class IndexerService {
     private baseUrl: string;
   
     constructor(baseUrl: string) {
       this.baseUrl = baseUrl;
     }
   
     async getAddressBalance(address: string): Promise<number> {
       const response = await axios.get(
         `${this.baseUrl}/address/${address}/balance`
       );
       return response.data;
     }
   
     async getAddressUtxos(address: string): Promise<UtxoData[]> {
       const response = await axios.get(
         `${this.baseUrl}/address/${address}/utxo`
       );
       return response.data;
     }
   
     async publishTransaction(txHex: string): Promise<string> {
       const response = await axios.post(
         `${this.baseUrl}/tx`,
         { txHex }
       );
       return response.data.txid;
     }
   
     async getFeeEstimate(): Promise<number> {
       const response = await axios.get(
         `${this.baseUrl}/fee-estimates`
       );
       return response.data.fastestFee;
     }
   }
   ```

2. **Transaction Builder**
   - PSBT creation
   - Fee estimation
   - Input/output management

3. **Taproot Implementation**
   - Script tree building
   - Time-lock scripts
   - Multi-sig recovery paths

### Phase 3: Nostr Integration (Week 5-6)

1. **Nostr Service Implementation**
   - Key derivation
   - Event publishing
   - Subscription management

2. **Project Management**
   - Create project
   - Publish metadata
   - Fetch projects

3. **Direct Messaging**
   - Encrypted communication
   - Signature exchange
   - Notification system

### Phase 4: UI Components (Week 7-8)

1. **Wallet Components**
   ```tsx
   // src/components/wallet/CreateWallet.tsx
   import React, { useState } from 'react';
   import { useWalletStore } from '../../stores/walletStore';
   import { WalletOperations } from '../../services/WalletOperations';
   
   export const CreateWallet: React.FC = () => {
     const [mnemonic, setMnemonic] = useState('');
     const [password, setPassword] = useState('');
     const createWallet = useWalletStore((state) => state.createWallet);
     const walletOps = new WalletOperations();
   
     const handleGenerate = () => {
       const words = walletOps.generateWalletWords();
       setMnemonic(words);
     };
   
     const handleCreate = () => {
       createWallet(mnemonic, password);
     };
   
     return (
       <div className="create-wallet">
         <h2>Create New Wallet</h2>
         <button onClick={handleGenerate}>Generate Mnemonic</button>
         {mnemonic && (
           <div>
             <div className="mnemonic-display">{mnemonic}</div>
             <input
               type="password"
               placeholder="Enter password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
             />
             <button onClick={handleCreate}>Create Wallet</button>
           </div>
         )}
       </div>
     );
   };
   ```

2. **Project Components**
   - Browse projects
   - Project details
   - Create project form

3. **Investment Components**
   - Investment form
   - Progress tracking
   - Recovery interface

### Phase 5: Angor Protocol Logic (Week 9-10)

1. **Founder Actions**
   - Create project transaction
   - Sign recovery transactions
   - Spend stage funds

2. **Investor Actions**
   - Create investment transaction
   - Monitor stages
   - Recover funds

3. **Transaction Actions Implementation**
   ```typescript
   // src/services/InvestorTransactionActions.ts
   export class InvestorTransactionActions {
     createInvestmentTransaction(
       projectInfo: ProjectInfo,
       investorKey: string,
       amount: number
     ): bitcoin.Transaction {
       // Implementation based on C# InvestorTransactionActions
       // Build transaction with Taproot outputs for each stage
     }
   
     buildRecoverTransaction(
       projectInfo: ProjectInfo,
       investmentTx: bitcoin.Transaction
     ): bitcoin.Transaction {
       // Build recovery transaction
     }
   
     signRecoveryTransaction(
       tx: bitcoin.Transaction,
       privateKey: string,
       founderSignatures: SignatureInfo
     ): bitcoin.Transaction {
       // Add signatures
     }
   }
   ```

### Phase 6: Testing & Refinement (Week 11-12)

1. **Unit Tests**
   - Wallet operations
   - Transaction building
   - Encryption

2. **Integration Tests**
   - Nostr communication
   - Indexer integration
   - End-to-end flows

3. **User Testing**
   - UI/UX refinement
   - Error handling
   - Performance optimization

---

## Key Implementation Notes

### 1. Taproot Complexity
The most complex part is implementing Bitcoin Taproot script trees. The C# codebase uses NBitcoin which has full Taproot support. In JavaScript, you may need to:
- Use `bitcoinjs-lib` v6+ with Taproot support
- Implement custom script tree building
- Handle Schnorr signatures correctly

### 2. Nostr Key Derivation
Match the exact derivation path from C#:
```typescript
// This must match DerivationOperations.cs
function deriveProjectNostrKey(
  walletWords: WalletWords,
  founderKey: string
): string {
  // Implement exact same derivation as C#
  // Using BIP32 path + founder key mixing
}
```

### 3. Time-Lock Scripts
Bitcoin time-locks use either:
- `OP_CHECKLOCKTIMEVERIFY` (CLTV) - absolute time
- `OP_CHECKSEQUENCEVERIFY` (CSV) - relative time

Angor uses CLTV for stage releases and expiry dates.

### 4. Fee Estimation
Always check current network fees:
```typescript
async function estimateFee(): Promise<number> {
  const indexer = new IndexerService();
  const estimates = await indexer.getFeeEstimate();
  return estimates.fastestFee; // sat/vB
}
```

### 5. Error Handling
Implement robust error handling for:
- Network failures
- Transaction rejection
- Signature verification
- Nostr relay disconnections

---

## Additional Resources

### Documentation
- Bitcoin: https://bitcoin.org/en/developer-documentation
- Taproot: https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki
- Nostr: https://github.com/nostr-protocol/nips
- BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- BIP32: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
- BIP84: https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki

### Libraries
- bitcoinjs-lib: https://github.com/bitcoinjs/bitcoinjs-lib
- nostr-tools: https://github.com/nbd-wtf/nostr-tools
- bip39: https://github.com/bitcoinjs/bip39
- bip32: https://github.com/bitcoinjs/bip32

### Testing Networks
- Bitcoin Testnet: For safe testing without real Bitcoin
- Signet: More controlled test environment
- Regtest: Local testing network

---

## Conclusion

This guide provides a comprehensive foundation for implementing Angor in React. The key challenges are:

1. **Taproot Implementation**: Most complex part, requires deep Bitcoin knowledge
2. **Nostr Integration**: Relatively straightforward with nostr-tools
3. **State Management**: Critical for managing wallet, projects, and UI state
4. **Security**: Proper encryption and secure storage is essential

Start with Phase 1 (infrastructure), then gradually build up the Bitcoin and Nostr integrations. Test extensively on testnet before any mainnet deployment.

The C# codebase in the Angor repository is your reference implementation - study it carefully, especially the Protocol folder for transaction building logic.
