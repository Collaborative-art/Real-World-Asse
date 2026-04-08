'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Asset, User, Shareholding } from '@/types/stellar'
import { StellarService } from '@/lib/stellar'
import { formatCurrency, formatPercentage, formatTimestamp } from '@/lib/utils'
import { TrendingUp, DollarSign, PieChart, Calendar, Download, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

export default function Portfolio() {
  const [user, setUser] = useState<User | null>(null)
  const [shareholdings, setShareholdings] = useState<Shareholding[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [totalYieldEarned, setTotalYieldEarned] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const stellarService = new StellarService({
    contractId: process.env.NEXT_PUBLIC_CONTRACT_ID || '',
    usdcTokenId: process.env.NEXT_PUBLIC_USDC_TOKEN_ID || '',
    network: 'testnet'
  })

  useEffect(() => {
    if (user) {
      loadPortfolioData()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const loadPortfolioData = async () => {
    if (!user) return

    try {
      const [holdings, allAssets, value] = await Promise.all([
        stellarService.getUserShareholdings(user.publicKey),
        stellarService.getAssets(),
        stellarService.getPortfolioValue(user.publicKey)
      ])

      setShareholdings(holdings)
      setAssets(allAssets)
      setPortfolioValue(value)
      
      // Calculate mock yield data (in a real app, this would come from the contract)
      const mockYield = holdings.reduce((total, holding) => {
        const asset = allAssets.find(a => a.id === holding.asset_id)
        if (asset) {
          const annualYield = (holding.shares * asset.price_per_share / 1000000) * (asset.annual_yield_rate / 10000)
          const daysSinceLastClaim = (Date.now() / 1000 - holding.last_yield_claimed) / 86400
          return total + (annualYield * daysSinceLastClaim / 365)
        }
        return total
      }, 0)
      setTotalYieldEarned(mockYield)
    } catch (error) {
      console.error('Failed to load portfolio data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mock data for charts
  const performanceData = [
    { month: 'Jan', value: portfolioValue * 0.95 },
    { month: 'Feb', value: portfolioValue * 0.97 },
    { month: 'Mar', value: portfolioValue * 0.98 },
    { month: 'Apr', value: portfolioValue * 0.99 },
    { month: 'May', value: portfolioValue * 1.01 },
    { month: 'Jun', value: portfolioValue },
  ]

  const pieChartData = shareholdings.map(holding => {
    const asset = assets.find(a => a.id === holding.asset_id)
    return {
      name: asset?.name || 'Unknown Asset',
      value: holding.shares * (asset?.price_per_share || 0) / 1000000,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }
  })

  const yieldData = [
    { month: 'Jan', yield: 150 },
    { month: 'Feb', yield: 180 },
    { month: 'Mar', yield: 165 },
    { month: 'Apr', yield: 200 },
    { month: 'May', yield: 220 },
    { month: 'Jun', yield: totalYieldEarned },
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header user={user} onUserChange={setUser} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your Freighter wallet to view your investment portfolio and track your earnings.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header user={user} onUserChange={setUser} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header user={user} onUserChange={setUser} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Portfolio</h1>
            <p className="text-gray-600">Track your RWA investments and earnings</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                Invest More
              </Button>
            </Link>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-green-600">+12.5%</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioValue)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <span className="text-sm text-green-600">+8.3%</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Yield Earned</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalYieldEarned)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <PieChart className="w-8 h-8 text-purple-600" />
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Assets Owned</p>
              <p className="text-2xl font-bold text-gray-900">{shareholdings.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-orange-600" />
                <span className="text-sm text-gray-600">Avg.</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Portfolio APY</p>
              <p className="text-2xl font-bold text-gray-900">
                {shareholdings.length > 0 
                  ? (shareholdings.reduce((sum, holding) => {
                      const asset = assets.find(a => a.id === holding.asset_id)
                      return sum + (asset?.annual_yield_rate || 0)
                    }, 0) / shareholdings.length / 100).toFixed(1)
                  : '0'}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Yield History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Yield History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="yield" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {shareholdings.length > 0 ? (
              <div className="space-y-4">
                {shareholdings.map((holding) => {
                  const asset = assets.find(a => a.id === holding.asset_id)
                  if (!asset) return null

                  const holdingValue = holding.shares * asset.price_per_share / 1000000
                  const monthlyYield = holdingValue * (asset.annual_yield_rate / 10000) / 12

                  return (
                    <div key={holding.asset_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                        <p className="text-sm text-gray-600">{asset.location}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-600">
                            {holding.shares.toLocaleString()} shares
                          </span>
                          <span className="text-green-600 font-medium">
                            {formatPercentage(asset.annual_yield_rate, true)} APY
                          </span>
                          <span className="text-gray-600">
                            Last claim: {formatTimestamp(holding.last_yield_claimed)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(holdingValue)}</p>
                        <p className="text-sm text-green-600">~{formatCurrency(monthlyYield)}/mo</p>
                      </div>
                      <Link href={`/asset/${holding.asset_id}`}>
                        <Button variant="outline" size="sm" className="ml-4">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Holdings Yet</h3>
                <p className="text-gray-600 mb-4">Start investing in real-world assets to build your portfolio</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Browse Assets
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
