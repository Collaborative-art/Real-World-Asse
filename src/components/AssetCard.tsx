'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Asset } from '@/types/stellar'
import { formatCurrency, formatPercentage, formatShares, calculateFundingPercentage } from '@/lib/utils'
import { Building2, MapPin, TrendingUp, Users } from 'lucide-react'

interface AssetCardProps {
  asset: Asset
  user?: { publicKey: string; isConnected: boolean } | null
}

export function AssetCard({ asset, user }: AssetCardProps) {
  const fundingPercentage = calculateFundingPercentage(asset.shares_sold, asset.total_shares)
  const availableShares = asset.total_shares - asset.shares_sold

  return (
    <Card className="asset-card-hover overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48">
          <Image
            src={asset.image_url || '/api/placeholder/400/300'}
            alt={asset.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-sm font-semibold text-green-600">
              {formatPercentage(asset.annual_yield_rate, true)} APY
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{asset.name}</h3>
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{asset.location}</span>
            </div>
            {asset.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{asset.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center text-gray-600">
                <Building2 className="w-4 h-4 mr-1" />
                <span className="text-xs">Total Value</span>
              </div>
              <p className="font-semibold text-gray-900">
                {formatCurrency(asset.total_value)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-gray-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-xs">Price/Share</span>
              </div>
              <p className="font-semibold text-gray-900">
                {formatCurrency(asset.price_per_share / 1000000)} {/* Convert from smallest unit */}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span>Funding Progress</span>
              </div>
              <span className="font-semibold text-gray-900">{fundingPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={fundingPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{formatShares(asset.shares_sold)} shares sold</span>
              <span>{formatShares(availableShares)} available</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/asset/${asset.id}`} className="w-full">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
