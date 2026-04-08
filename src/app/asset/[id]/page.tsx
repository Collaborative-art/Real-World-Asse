'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Asset, User } from '@/types/stellar'
import { StellarService } from '@/lib/stellar'
import { formatCurrency, formatPercentage, calculateFundingPercentage, formatShares } from '@/lib/utils'
import { ArrowLeft, Building2, MapPin, TrendingUp, Users, FileText, Shield, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function AssetDetail() {
  const params = useParams()
  const assetId = params.id as string
  
  const [asset, setAsset] = useState<Asset | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const stellarService = new StellarService({
    contractId: process.env.NEXT_PUBLIC_CONTRACT_ID || '',
    usdcTokenId: process.env.NEXT_PUBLIC_USDC_TOKEN_ID || '',
    network: 'testnet'
  })

  useEffect(() => {
    loadAsset()
  }, [assetId])

  const loadAsset = async () => {
    try {
      const assets = await stellarService.getAssets()
      const foundAsset = assets.find(a => a.id === assetId)
      setAsset(foundAsset || null)
    } catch (error) {
      console.error('Failed to load asset:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!user || !asset || !purchaseAmount) return

    setIsPurchasing(true)
    try {
      const sharesToBuy = parseInt(purchaseAmount)
      await stellarService.purchaseShares(asset.id, sharesToBuy, user.publicKey)
      
      // Refresh asset data
      await loadAsset()
      setPurchaseAmount('')
      
      // Show success message (you could add a toast here)
      alert('Purchase successful!')
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Purchase failed. Please try again.')
    } finally {
      setIsPurchasing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header user={user} onUserChange={setUser} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header user={user} onUserChange={setUser} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Asset Not Found</h2>
            <p className="text-gray-600 mb-6">The asset you're looking for doesn't exist or has been removed.</p>
            <Link href="/">
              <Button>Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const fundingPercentage = calculateFundingPercentage(asset.shares_sold, asset.total_shares)
  const availableShares = asset.total_shares - asset.shares_sold
  const estimatedAnnualReturn = (asset.price_per_share / 1000000) * (asset.annual_yield_rate / 10000)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header user={user} onUserChange={setUser} />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Asset Header */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h1 className="text-3xl font-bold mb-2">{asset.name}</h1>
                  <div className="flex items-center text-white/90">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{asset.location}</span>
                  </div>
                </div>
                <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-white font-bold">
                    {formatPercentage(asset.annual_yield_rate, true)} APY
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  {asset.description || 'Invest in this premium real-world asset and earn passive income through fractional ownership. This asset has been thoroughly vetted and offers competitive returns with stable cash flow.'}
                </p>
              </div>
            </div>

            {/* Asset Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                    Asset Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value</span>
                    <span className="font-semibold">{formatCurrency(asset.total_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Shares</span>
                    <span className="font-semibold">{formatShares(asset.total_shares)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per Share</span>
                    <span className="font-semibold">{formatCurrency(asset.price_per_share / 1000000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-semibold ${asset.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Investment Returns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Yield Rate</span>
                    <span className="font-semibold text-green-600">
                      {formatPercentage(asset.annual_yield_rate, true)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Annual Return/Share</span>
                    <span className="font-semibold">{formatCurrency(estimatedAnnualReturn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Funding Progress</span>
                    <span className="font-semibold">{fundingPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Shares</span>
                    <span className="font-semibold">{formatShares(availableShares)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Funding Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Funding Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={fundingPercentage} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {formatShares(asset.shares_sold)} shares sold
                    </span>
                    <span className="text-gray-600">
                      {formatShares(availableShares)} shares remaining
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{fundingPercentage.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Funded</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatShares(asset.shares_sold)}
                      </p>
                      <p className="text-sm text-gray-600">Investors</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency((asset.shares_sold * asset.price_per_share) / 1000000)}
                      </p>
                      <p className="text-sm text-gray-600">Raised</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-orange-600" />
                  Legal Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-3 text-gray-600" />
                      <span className="text-sm font-medium">Investment Memorandum</span>
                    </div>
                    <Button variant="outline" size="sm">View PDF</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-3 text-gray-600" />
                      <span className="text-sm font-medium">Due Diligence Report</span>
                    </div>
                    <Button variant="outline" size="sm">View PDF</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-3 text-gray-600" />
                      <span className="text-sm font-medium">Financial Projections</span>
                    </div>
                    <Button variant="outline" size="sm">View PDF</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Shares</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!user ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">Connect your wallet to invest</p>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                        Connect Wallet
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Shares
                          </label>
                          <input
                            type="number"
                            value={purchaseAmount}
                            onChange={(e) => setPurchaseAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            max={availableShares}
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            {availableShares > 0 ? `${formatShares(availableShares)} shares available` : 'No shares available'}
                          </p>
                        </div>

                        {purchaseAmount && (
                          <div className="border-t pt-4">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Shares</span>
                              <span className="font-medium">{purchaseAmount}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Price per Share</span>
                              <span className="font-medium">{formatCurrency(asset.price_per_share / 1000000)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                              <span>Total Cost</span>
                              <span>{formatCurrency((parseInt(purchaseAmount) * asset.price_per_share) / 1000000)}</span>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handlePurchase}
                          disabled={!purchaseAmount || isPurchasing || availableShares === 0}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isPurchasing ? 'Processing...' : 'Purchase Shares'}
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Investment Highlights</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">·</span>
                        <span>Stable rental income with long-term leases</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">·</span>
                        <span>Professional property management</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">·</span>
                        <span>Monthly dividend distributions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">·</span>
                        <span>Transparent on-chain accounting</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
