// Angor Core Types
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

export interface ProjectSeeders {
  threshold: number;
  secretHashes: string[];
  seeders: Seeder[];
}

export interface Seeder {
  publicKey: string;
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
  transaction: unknown;
  transactionFee: number;
}

export interface SignatureInfo {
  projectIdentifier: string;
  signatures: string[];
}

export interface InvestmentInfo {
  projectIdentifier: string;
  investorKey: string;
  investmentAmount: number;
  transactionId: string;
  isRecovered: boolean;
  stages: InvestmentStage[];
}

export interface InvestmentStage {
  stageIndex: number;
  amount: number;
  releaseDate: Date;
  isReleased: boolean;
}

export interface NetworkConfig {
  network: 'mainnet' | 'testnet';
  indexerUrl: string;
  mempoolUrl: string;
}

export interface FeeEstimate {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

export interface ProjectStats {
  totalRaised: number;
  investorCount: number;
  stageCount: number;
  currentStage: number;
  nextReleaseDate?: Date;
  status: ProjectStatus;
}

export type ProjectStatus = 
  | 'draft'
  | 'active'
  | 'funded'
  | 'inProgress'
  | 'completed'
  | 'cancelled';

export interface FounderInfo {
  founderKey: string;
  founderRecoveryKey: string;
  nostrPubKey: string;
  projectCount: number;
}

export interface InvestorInfo {
  investorKey: string;
  totalInvested: number;
  projectCount: number;
  investmentCount: number;
}
