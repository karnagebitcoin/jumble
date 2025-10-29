import client from './client.service'
import { Event } from 'nostr-tools'

const GIFBUDDY_RELAY = 'wss://relay.gifbuddy.lol'

export interface GifEvent extends Event {
  kind: 1063
}

export interface GifData {
  url: string
  previewUrl?: string
  alt?: string
  size?: string
  hash?: string
  eventId?: string
}

export interface GifSearchResult {
  gifs: GifData[]
  total: number
}

class GifService {
  private recentGifsCache: GifData[] = []
  private totalGifCount: number = 0
  private gifEventToData(event: GifEvent): GifData | null {
    const urlTag = event.tags.find((tag) => tag[0] === 'url')
    if (!urlTag || !urlTag[1]) return null

    const url = urlTag[1]
    const mimeType = event.tags.find((tag) => tag[0] === 'm')?.[1]

    // Only return GIFs
    if (mimeType && !mimeType.includes('gif')) return null

    const thumbTag = event.tags.find((tag) => tag[0] === 'thumb')
    const imageTag = event.tags.find((tag) => tag[0] === 'image')
    const altTag = event.tags.find((tag) => tag[0] === 'alt')
    const sizeTag = event.tags.find((tag) => tag[0] === 'size')
    const hashTag = event.tags.find((tag) => tag[0] === 'x')

    return {
      url,
      previewUrl: thumbTag?.[1] || imageTag?.[1] || url,
      alt: altTag?.[1] || event.content,
      size: sizeTag?.[1],
      hash: hashTag?.[1],
      eventId: event.id
    }
  }

  async fetchRecentGifs(limit: number = 12): Promise<GifSearchResult> {
    try {
      console.log('[GifService] Fetching recent GIFs from relay:', GIFBUDDY_RELAY)

      // Add a timeout promise
      const timeoutPromise = new Promise<GifEvent[]>((_, reject) => {
        setTimeout(() => reject(new Error('Relay query timeout')), 10000)
      })

      const queryPromise = client.pool.querySync([GIFBUDDY_RELAY], {
        kinds: [1063],
        limit: limit * 2 // Fetch more in case some are filtered out
      }) as Promise<GifEvent[]>

      const events = await Promise.race([queryPromise, timeoutPromise])

      console.log('[GifService] Received events:', events.length)

      const allGifs = events
        .map((event) => this.gifEventToData(event))
        .filter((gif): gif is GifData => gif !== null)

      const gifs = allGifs.slice(0, limit)

      console.log('[GifService] Processed GIFs:', gifs.length, 'Total available:', allGifs.length)

      if (gifs.length > 0) {
        this.recentGifsCache = gifs
        this.totalGifCount = allGifs.length
      }

      return {
        gifs,
        total: allGifs.length
      }
    } catch (error) {
      console.error('[GifService] Error fetching recent GIFs:', error)
      return {
        gifs: this.recentGifsCache.length > 0 ? this.recentGifsCache : [],
        total: this.totalGifCount
      }
    }
  }

  async searchGifs(query: string, limit: number = 12): Promise<GifSearchResult> {
    if (!query.trim()) {
      return this.fetchRecentGifs(limit)
    }

    try {
      console.log('[GifService] Searching GIFs for query:', query)

      // Add a timeout promise
      const timeoutPromise = new Promise<GifEvent[]>((_, reject) => {
        setTimeout(() => reject(new Error('Relay query timeout')), 10000)
      })

      // First try to search NIP-94 events on gifbuddy.lol relay
      // We'll fetch many GIFs and filter client-side as search may not be supported
      const queryPromise = client.pool.querySync([GIFBUDDY_RELAY], {
        kinds: [1063],
        limit: 500 // Fetch more to filter
      }) as Promise<GifEvent[]>

      const events = await Promise.race([queryPromise, timeoutPromise])

      console.log('[GifService] Received events for search:', events.length)

      const allMatchingGifs = events
        .map((event) => this.gifEventToData(event))
        .filter((gif): gif is GifData => gif !== null)
        .filter(
          (gif) =>
            gif.alt?.toLowerCase().includes(query.toLowerCase()) ||
            gif.url.toLowerCase().includes(query.toLowerCase())
        )

      const gifs = allMatchingGifs.slice(0, limit)

      console.log('[GifService] Filtered GIFs:', gifs.length, 'Total matching:', allMatchingGifs.length)

      return {
        gifs,
        total: allMatchingGifs.length
      }
    } catch (error) {
      console.error('[GifService] Error searching GIFs:', error)
      return {
        gifs: [],
        total: 0
      }
    }
  }

  getRecentGifsCache(): GifData[] {
    return this.recentGifsCache
  }
}

const gifService = new GifService()
export default gifService
