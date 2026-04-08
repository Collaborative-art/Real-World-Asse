'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Asset, User, AssetCreationParams } from '@/types/stellar'
import { StellarService } from '@/lib/stellar'
import { formatCurrency, formatPercentage, generateAssetId } from '@/lib/utils'
import { Plus, DollarSign, TrendingUp, Users, FileText, Settings } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showYieldForm, setShowYieldForm] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [yieldAmount, setYieldAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Form state for asset creation
  const [assetForm, setAssetForm] = useState<AssetCreationParams>({
    name: '',
    location: '',
    total_value: 0,
    annual_yield_rate: 0,
    total_shares: 0,
    price_per_share: 0,
    image_url: '',
    description: ''
  })

  const stellarService = new StellarService({
    contractId: process.env.NEXT_PUBLIC_CONTRACT_ID || '',
    usdcTokenId: process.env.NEXT_PUBLIC_USDC_TOKEN_ID || '',
    network: 'testnet'
  })

  useEffect(() => {
    loadAssets()
  }, [])

  const loadAssets = async () => {
    try {
      const fetchedAssets = await stellarService.getAssets()
      setAssets(fetchedAssets)
    } catch (error) {
      console.error('Failed to load assets:', error)
    }
  }

  const handleCreateAsset = async () => {
    if (!user || !assetForm.name || !assetForm.location) return

    setIsLoading(true)
    try {
      // This would call the Soroban contract's create_asset_token function
      // For now, this is a mock implementation
      const newAsset: Asset = {
        id: generateAssetId(),
        ...assetForm,
        shares_sold: 0,
        is_active: true
      }

      setAssets([...assets, newAsset])
      setShowCreateForm(false)
      setAssetForm({
        name: '',
        location: '',
        total_value: 0,
        annual_yield_rate: 0,
        total_shares: 0,
        price_per_share: 0,
        image_url: '',
        description: ''
      })

      alert('Asset created successfully!')
    } catch (error) {
      console.error('Failed to create asset:', error)
      alert('Failed to create asset. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDistributeYield = async () => {
    if (!user || !selectedAsset || !yieldAmount) return

    setIsLoading(true)
    try {
      // This would call the Soroban contract's distribute_yield function
      // For now, this is a mock implementation
      alert(`Distributed ${formatCurrency(parseFloat(yieldAmount))} yield to ${selectedAsset.name} holders`)
      setShowYieldForm(false)
      setYieldAmount('')
      setSelectedAsset(null)
    } catch (error) {
      console.error('Failed to distribute yield:', error)
      alert('Failed to distribute yield. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.total_value, 0)
  const totalShares = assets.reduce((sum, asset) => sum + asset.total_shares, 0)
  const totalSoldShares = assets.reduce((sum, asset) => sum + asset.shares_sold, 0)
  const averageYield = assets.length > 0 ? assets.reduce((sum, asset) => sum + asset.annual_yield_rate, 0) / assets.length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header user={user} onUserChange={setUser} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage assets and distribute yields</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Asset
            </Button>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-green-600">+2 this month</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <span className="text-sm text-green-600">+15% growth</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPortfolioValue)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-purple-600" />
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Shares Sold</p>
              <p className="text-2xl font-bold text-gray-900">{totalSoldShares.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <span className="text-sm text-gray-600">Average</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Platform APY</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(averageYield, true)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Assets Management */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Management</CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length > 0 ? (
              <div className="space-y-4">
                {assets.map((asset) => {
                  const fundingPercentage = (asset.shares_sold / asset.total_shares) * 100
                  const raisedAmount = (asset.shares_sold * asset.price_per_share) / 1000000

                  return (
                    <div key={asset.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                        <p className="text-sm text-gray-600">{asset.location}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-600">
                            {formatCurrency(asset.total_value)} total value
                          </span>
                          <span className="text-green-600 font-medium">
                            {formatPercentage(asset.annual_yield_rate, true)} APY
                          </span>
                          <span className="text-gray-600">
                            {fundingPercentage.toFixed(1)}% funded
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(raisedAmount)} raised</p>
                        <p className="text-sm text-gray-600">{asset.shares_sold.toLocaleString()} shares sold</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link href={`/asset/${asset.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAsset(asset)
                            setShowYieldForm(true)
                          }}
                        >
                          Distribute Yield
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assets Created</h3>
                <p className="text-gray-600 mb-4">Create your first asset to start the platform</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Asset
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Asset Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Create New Asset</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asset Name
                    </label>
                    <input
                      type="text"
                      value={assetForm.name}
                      onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Manhattan Commercial Building"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={assetForm.location}
                      onChange={(e) => setAssetForm({...assetForm, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., New York, NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Value ($)
                    </label>
                    <input
                      type="number"
                      value={assetForm.total_value || ''}
                      onChange={(e) => setAssetForm({...assetForm, total_value: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Yield Rate (%)
                    </label>
                    <input
                      type="number"
                      value={assetForm.annual_yield_rate || ''}
                      onChange={(e) => setAssetForm({...assetForm, annual_yield_rate: parseFloat(e.target.value) * 100 || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="8.5"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Shares
                    </label>
                    <input
                      type="number"
                      value={assetForm.total_shares || ''}
                      onChange={(e) => setAssetForm({...assetForm, total_shares: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Share ($)
                    </label>
                    <input
                      type="number"
                      value={assetForm.price_per_share || ''}
                      onChange={(e) => setAssetForm({...assetForm, price_per_share: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={assetForm.description}
                    onChange={(e) => setAssetForm({...assetForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the asset and its investment potential..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={assetForm.image_url}
                    onChange={(e) => setAssetForm({...assetForm, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreateAsset}
                    disabled={isLoading || !assetForm.name || !assetForm.location}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {isLoading ? 'Creating...' : 'Create Asset'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Distribute Yield Modal */}
        {showYieldForm && selectedAsset && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Distribute Yield</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Asset</p>
                  <p className="font-semibold">{selectedAsset.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Total Shareholders</p>
                  <p className="font-semibold">{selectedAsset.shares_sold.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yield Amount ($)
                  </label>
                  <input
                    type="number"
                    value={yieldAmount}
                    onChange={(e) => setYieldAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10000"
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Each shareholder will receive approximately{' '}
                    {yieldAmount ? formatCurrency(parseFloat(yieldAmount) / selectedAsset.shares_sold) : '$0.00'}
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleDistributeYield}
                    disabled={isLoading || !yieldAmount}
                    className="bg-gradient-to-r from-green-600 to-green-700"
                  >
                    {isLoading ? 'Distributing...' : 'Distribute Yield'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowYieldForm(false)
                      setSelectedAsset(null)
                      setYieldAmount('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
