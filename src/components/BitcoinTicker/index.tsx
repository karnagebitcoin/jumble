import { useEffect, useState } from 'react'
import { useWidgets } from '@/providers/WidgetsProvider'
import { cn } from '@/lib/utils'

type BitcoinPrice = {
  usd: number
}

export default function BitcoinTicker() {
  const { bitcoinTickerAlignment, bitcoinTickerTextSize } = useWidgets()
  const [price, setPrice] = useState<BitcoinPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
        )
        if (!response.ok) {
          throw new Error('Failed to fetch Bitcoin price')
        }
        const data = await response.json()
        setPrice({
          usd: data.bitcoin.usd
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

  const alignmentClass = bitcoinTickerAlignment === 'center' ? 'justify-center' : 'justify-start'
  const textSizeClass = bitcoinTickerTextSize === 'small' ? 'text-lg' : 'text-4xl'

  if (loading) {
    return (
      <div className={cn('flex items-center px-6 py-3', alignmentClass)}>
        <div className="animate-pulse text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error || !price) {
    return (
      <div className={cn('flex items-center px-6 py-3', alignmentClass)}>
        <div className="text-sm text-red-500">{error || 'Failed to load price'}</div>
      </div>
    )
  }

  return (
    <div className={cn('px-6 py-3 flex items-center', alignmentClass)}>
      <div className={cn('font-bold', textSizeClass)}>{formatPrice(price.usd)}</div>
    </div>
  )
}
