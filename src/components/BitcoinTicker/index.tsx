import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

type BitcoinPrice = {
  usd: number
  usd_24h_change: number
}

export default function BitcoinTicker() {
  const [price, setPrice] = useState<BitcoinPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
        )
        if (!response.ok) {
          throw new Error('Failed to fetch Bitcoin price')
        }
        const data = await response.json()
        setPrice({
          usd: data.bitcoin.usd,
          usd_24h_change: data.bitcoin.usd_24h_change
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch price')
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
    // Refresh price every 60 seconds
    const interval = setInterval(fetchPrice, 60000)

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />
    if (change < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500'
    if (change < 0) return 'text-red-500'
    return 'text-muted-foreground'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-pulse text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error || !price) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-sm text-red-500">{error || 'Failed to load price'}</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
            ₿
          </div>
          <div>
            <div className="font-semibold text-sm">Bitcoin</div>
            <div className="text-xs text-muted-foreground">BTC</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">{formatPrice(price.usd)}</div>
          <div className={cn('flex items-center gap-1 text-sm font-medium', getChangeColor(price.usd_24h_change))}>
            {getChangeIcon(price.usd_24h_change)}
            <span>{formatChange(price.usd_24h_change)}</span>
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground text-center">24h change</div>
    </div>
  )
}
