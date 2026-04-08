import { Asset, Shareholding, Portfolio, ContractConfig } from '@/types/stellar'
import { Server, Networks, TransactionBuilder, Asset as StellarAsset, Operation } from '@stellar/stellar-sdk'

export class StellarService {
  private server: Server
  private contractConfig: ContractConfig

  constructor(config: ContractConfig) {
    this.server = new Server(config.network === 'testnet' 
      ? 'https://horizon-testnet.stellar.org' 
      : 'https://horizon.stellar.org')
    this.contractConfig = config
  }

  async connectWallet(): Promise<string | null> {
    if (typeof window === 'undefined' || !window.freight) {
      throw new Error('Freighter wallet is not installed')
    }

    try {
      const publicKey = await window.freight.getPublicKey()
      return publicKey
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      return null
    }
  }

  async disconnectWallet(): Promise<void> {
    // Freighter doesn't have a disconnect method, but we can clear local state
    // This would be handled by the React state management
  }

  async getBalance(address: string): Promise<number> {
    try {
      const account = await this.server.loadAccount(address)
      const usdcBalance = account.balances.find(
        (balance: any) => balance.asset_code === 'USDC' && balance.asset_issuer === this.contractConfig.usdcTokenId
      )
      
      return usdcBalance ? parseFloat(usdcBalance.balance) : 0
    } catch (error) {
      console.error('Failed to get balance:', error)
      return 0
    }
  }

  async purchaseShares(
    assetId: string, 
    sharesToBuy: number, 
    userPublicKey: string
  ): Promise<string> {
    try {
      const account = await this.server.loadAccount(userPublicKey)
      
      // This would interact with the Soroban contract
      // For now, this is a placeholder implementation
      
      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: this.contractConfig.network === 'testnet' 
          ? Networks.TESTNET 
          : Networks.PUBLIC,
      })
        .addOperation(Operation.payment({
          destination: this.contractConfig.contractId,
          asset: StellarAsset.native(),
          amount: '0.01', // Minimum fee
        }))
        .setTimeout(30)
        .build()

      // Sign transaction with Freighter
      const signedTransaction = await window.freight.signTransaction(transaction.toXDR())
      
      // Submit transaction
      const result = await this.server.submitTransaction(signedTransaction)
      
      return result.hash
    } catch (error) {
      console.error('Failed to purchase shares:', error)
      throw error
    }
  }

  async getAssets(): Promise<Asset[]> {
    // This would call the Soroban contract to get all assets
    // For now, returning mock data
    return [
      {
        id: 'asset-1',
        name: 'Manhattan Commercial Building',
        location: 'New York, NY',
        total_value: 5000000,
        annual_yield_rate: 850, // 8.5%
        total_shares: 1000000,
        shares_sold: 250000,
        price_per_share: 5,
        is_active: true,
        image_url: '/api/placeholder/400/300',
        description: 'Prime commercial property in downtown Manhattan with stable rental income.',
      },
      {
        id: 'asset-2',
        name: 'Solar Farm Arizona',
        location: 'Phoenix, AZ',
        total_value: 2500000,
        annual_yield_rate: 1200, // 12%
        total_shares: 500000,
        shares_sold: 400000,
        price_per_share: 5,
        is_active: true,
        image_url: '/api/placeholder/400/300',
        description: 'Utility-scale solar farm with long-term power purchase agreements.',
      },
    ]
  }

  async getUserShareholdings(userPublicKey: string): Promise<Shareholding[]> {
    // This would call the Soroban contract to get user's shareholdings
    // For now, returning mock data
    return [
      {
        owner: userPublicKey,
        asset_id: 'asset-1',
        shares: 1000,
        last_yield_claimed: Date.now() / 1000 - 86400 * 30, // 30 days ago
      },
    ]
  }

  async getPortfolioValue(userPublicKey: string): Promise<number> {
    const shareholdings = await this.getUserShareholdings(userPublicKey)
    const assets = await this.getAssets()
    
    let totalValue = 0
    for (const holding of shareholdings) {
      const asset = assets.find(a => a.id === holding.asset_id)
      if (asset) {
        totalValue += holding.shares * asset.price_per_share
      }
    }
    
    return totalValue
  }
}

// Extend the Window interface for Freighter
declare global {
  interface Window {
    freight: {
      getPublicKey(): Promise<string>
      signTransaction(xdr: string): Promise<string>
      isConnected(): Promise<boolean>
    }
  }
}
