export interface Asset {
  id: string;
  name: string;
  location: string;
  total_value: number;
  annual_yield_rate: number; // in basis points (10000 = 100%)
  total_shares: number;
  shares_sold: number;
  price_per_share: number; // in USDC (smallest unit)
  is_active: boolean;
  image_url?: string;
  description?: string;
  legal_documents?: string[];
}

export interface Shareholding {
  owner: string;
  asset_id: string;
  shares: number;
  last_yield_claimed: number; // timestamp
}

export interface Portfolio {
  total_value: number;
  total_yield_earned: number;
  holdings: Shareholding[];
}

export interface User {
  publicKey: string;
  isConnected: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'yield_distribution';
  asset_id: string;
  amount: number;
  timestamp: number;
  from: string;
  to: string;
}

export interface ContractConfig {
  contractId: string;
  usdcTokenId: string;
  network: 'testnet' | 'mainnet';
}

export interface AssetCreationParams {
  name: string;
  location: string;
  total_value: number;
  annual_yield_rate: number;
  total_shares: number;
  price_per_share: number;
  image_url?: string;
  description?: string;
}
