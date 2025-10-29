import client from './client.service'
import { Event } from 'nostr-tools'

const GIFBUDDY_RELAY = 'wss://relay.gifbuddy.lol'
const GIFBUDDY_API_KEY = 'buddy_wxjVKLLfAfYhagUvi5C_9riphncgkGGGHXIkkNMZv0M'
const GIFBUDDY_API_URL = 'https://api.gifbuddy.lol'

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

class GifService {
  private recentGifsCache: GifData[] = []
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

  async fetchRecentGifs(limit: number = 12): Promise<GifData[]> {
    try {
      console.log('[GifService] Fetching recent GIFs from relay:', GIFBUDDY_RELAY)

      // Add a timeout promise
      const timeoutPromise = new Promise<GifEvent[]>((_, reject) => {
        setTimeout(() => reject(new Error('Relay query timeout')), 5000)
      })

      const queryPromise = client.pool.querySync([GIFBUDDY_RELAY], {
        kinds: [1063],
        limit: limit * 2 // Fetch more in case some are filtered out
      }) as Promise<GifEvent[]>

      const events = await Promise.race([queryPromise, timeoutPromise])

      console.log('[GifService] Received events:', events.length)

      const gifs = events
        .map((event) => this.gifEventToData(event))
        .filter((gif): gif is GifData => gif !== null)
        .slice(0, limit)

      console.log('[GifService] Processed GIFs:', gifs.length)

      if (gifs.length > 0) {
        this.recentGifsCache = gifs
      }

      return gifs
    } catch (error) {
      console.error('[GifService] Error fetching recent GIFs:', error)
      return this.recentGifsCache.length > 0 ? this.recentGifsCache : []
    }
  }

  async searchGifs(query: string, limit: number = 12): Promise<GifData[]> {
    if (!query.trim()) {
      return this.fetchRecentGifs(limit)
    }

    try {
      console.log('[GifService] Searching GIFs for query:', query)

      // Add a timeout promise
      const timeoutPromise = new Promise<GifEvent[]>((_, reject) => {
        setTimeout(() => reject(new Error('Relay query timeout')), 5000)
      })

      // First try to search NIP-94 events on gifbuddy.lol relay
      // We'll fetch recent GIFs and filter client-side as search may not be supported
      const queryPromise = client.pool.querySync([GIFBUDDY_RELAY], {
        kinds: [1063],
        limit: 200 // Fetch more to filter
      }) as Promise<GifEvent[]>

      const events = await Promise.race([queryPromise, timeoutPromise])

      console.log('[GifService] Received events for search:', events.length)

      const gifs = events
        .map((event) => this.gifEventToData(event))
        .filter((gif): gif is GifData => gif !== null)
        .filter(
          (gif) =>
            gif.alt?.toLowerCase().includes(query.toLowerCase()) ||
            gif.url.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit)

      console.log('[GifService] Filtered GIFs:', gifs.length)

      // If we got results, return them
      if (gifs.length > 0) {
        return gifs
      }

      // Otherwise, fall back to GIFBuddy API
      console.log('[GifService] No results from relay, trying API fallback')
      return this.searchGifsViaApi(query, limit)
    } catch (error) {
      console.error('[GifService] Error searching GIFs:', error)
      // Fall back to API on error
      return this.searchGifsViaApi(query, limit)
    }
  }

  private async searchGifsViaApi(query: string, limit: number = 12): Promise<GifData[]> {
    try {
      // Try the GIFBuddy API endpoint with proper headers
      const response = await fetch(
        `${GIFBUDDY_API_URL}/api/search_gifs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': GIFBUDDY_API_KEY
          },
          body: JSON.stringify({
            search: query,
            limit
          })
        }
      )

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()

      // The API response format may vary, adjust based on actual response
      // This is a placeholder implementation
      if (Array.isArray(data.results)) {
        return data.results.map((result: any) => ({
          url: result.url || result.media?.[0]?.gif?.url,
          previewUrl: result.preview || result.media?.[0]?.tinygif?.url,
          alt: result.title || result.content_description
        }))
      }

      return []
    } catch (error) {
      console.error('[GifService] Error fetching GIFs from API:', error)
      // API appears to be down, return empty array
      return []
    }
  }

  getRecentGifsCache(): GifData[] {
    return this.recentGifsCache
  }
}

const gifService = new GifService()
export default gifService
