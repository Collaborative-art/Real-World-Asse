'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { AssetCard } from '@/components/AssetCard'
import { Button } from '@/components/ui/button'
import { Asset, User } from '@/types/stellar'
import { StellarService } from '@/lib/stellar'
import { Search, Filter, TrendingUp } from 'lucide-react'

export default function Marketplace() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'yield' | 'value' | 'funding'>('yield')
  const [isLoading, setIsLoading] = useState(true)

  const stellarService = new StellarService({
    contractId: process.env.NEXT_PUBLIC_CONTRACT_ID || '',
    usdcTokenId: process.env.NEXT_PUBLIC_USDC_TOKEN_ID || '',
    network: 'testnet'
  })

  useEffect(() => {
    loadAssets()
  }, [])

  useEffect(() => {
    filterAndSortAssets()
  }, [assets, searchTerm, sortBy])

  const loadAssets = async () => {
    try {
      const fetchedAssets = await stellarService.getAssets()
      setAssets(fetchedAssets)
    } catch (error) {
      console.error('Failed to load assets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortAssets = () => {
    let filtered = assets

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort assets
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'yield':
          return b.annual_yield_rate - a.annual_yield_rate
        case 'value':
          return b.total_value - a.total_value
        case 'funding':
          const aFunding = (a.shares_sold / a.total_shares) * 100
          const bFunding = (b.shares_sold / b.total_shares) * 100
          return bFunding - aFunding
        default:
          return 0
      }
    })

    setFilteredAssets(filtered)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header user={user} onUserChange={setUser} />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Invest in <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Real-World Assets</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Fractional ownership of premium real estate, solar farms, and other income-generating assets on the Stellar blockchain
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assets by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'yield' | 'value' | 'funding')}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="yield">Highest Yield</option>
                <option value="value">Highest Value</option>
                <option value="funding">Most Funded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-600">Total Assets</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
            <p className="text-sm text-green-600 mt-1">+2 this month</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">$</span>
              </div>
              <span className="text-sm text-gray-600">Total Value</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${assets.reduce((sum, asset) => sum + asset.total_value, 0).toLocaleString()}
            </p>
            <p className="text-sm text-green-600 mt-1">+12% growth</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">%</span>
              </div>
              <span className="text-sm text-gray-600">Avg. APY</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {assets.length > 0 
                ? (assets.reduce((sum, asset) => sum + asset.annual_yield_rate, 0) / assets.length / 100).toFixed(1)
                : '0'}%
            </p>
            <p className="text-sm text-green-600 mt-1">Above market</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">F</span>
              </div>
              <span className="text-sm text-gray-600">Funded</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {assets.length > 0 
                ? Math.round(assets.reduce((sum, asset) => sum + (asset.shares_sold / asset.total_shares) * 100, 0) / assets.length)
                : 0}%
            </p>
            <p className="text-sm text-green-600 mt-1">Active funding</p>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Assets</h2>
            <p className="text-gray-600">
              {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'} found
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-96 animate-pulse border border-gray-200"></div>
              ))}
            </div>
          ) : filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No assets found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
