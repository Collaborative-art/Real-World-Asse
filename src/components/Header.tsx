'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { StellarService } from '@/lib/stellar'
import { truncateAddress } from '@/lib/utils'
import { User } from '@/types/stellar'

interface HeaderProps {
  user: User | null
  onUserChange: (user: User | null) => void
}

export function Header({ user, onUserChange }: HeaderProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [stellarService] = useState(() => new StellarService({
    contractId: process.env.NEXT_PUBLIC_CONTRACT_ID || '',
    usdcTokenId: process.env.NEXT_PUBLIC_USDC_TOKEN_ID || '',
    network: 'testnet'
  }))

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      const publicKey = await stellarService.connectWallet()
      if (publicKey) {
        onUserChange({
          publicKey,
          isConnected: true,
          kycStatus: 'pending'
        })
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    stellarService.disconnectWallet()
    onUserChange(null)
  }

  return (
    <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              StellarEstate
            </h1>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Marketplace
            </a>
            <a href="/portfolio" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Portfolio
            </a>
            <a href="/admin" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Admin
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-600">Connected</p>
                  <p className="text-sm font-mono text-gray-900">
                    {truncateAddress(user.publicKey)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={disconnectWallet}
                  className="hidden sm:flex"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
