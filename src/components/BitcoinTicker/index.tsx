import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
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

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-5 w-5" />
    if (change < 0) return <TrendingDown className="h-5 w-5" />
    return null
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
    <div className="p-6 flex items-center justify-center gap-3">
      <div className="text-4xl font-bold">{formatPrice(price.usd)}</div>
      <div className={cn('flex items-center', getChangeColor(price.usd_24h_change))}>
        {getChangeIcon(price.usd_24h_change)}
      </div>
    </div>
  )
}
