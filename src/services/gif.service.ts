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
      const events = (await client.pool.querySync([GIFBUDDY_RELAY], {
        kinds: [1063],
        limit
      })) as GifEvent[]

      const gifs = events
        .map((event) => this.gifEventToData(event))
        .filter((gif): gif is GifData => gif !== null)

      this.recentGifsCache = gifs
      return gifs
    } catch (error) {
      console.error('Error fetching recent GIFs:', error)
      return this.recentGifsCache
    }
  }

  async searchGifs(query: string, limit: number = 12): Promise<GifData[]> {
    if (!query.trim()) {
      return this.fetchRecentGifs(limit)
    }

    try {
      // First try to search NIP-94 events on gifbuddy.lol relay
      // We'll fetch recent GIFs and filter client-side as search may not be supported
      const events = (await client.pool.querySync([GIFBUDDY_RELAY], {
        kinds: [1063],
        limit: 50 // Fetch more to filter
      })) as GifEvent[]

      const gifs = events
        .map((event) => this.gifEventToData(event))
        .filter((gif): gif is GifData => gif !== null)
        .filter(
          (gif) =>
            gif.alt?.toLowerCase().includes(query.toLowerCase()) ||
            gif.url.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit)

      // If we got results, return them
      if (gifs.length > 0) {
        return gifs
      }

      // Otherwise, fall back to GIFBuddy API
      return this.searchGifsViaApi(query, limit)
    } catch (error) {
      console.error('Error searching GIFs:', error)
      // Fall back to API on error
      return this.searchGifsViaApi(query, limit)
    }
  }

  private async searchGifsViaApi(query: string, limit: number = 12): Promise<GifData[]> {
    try {
      const response = await fetch(
        `${GIFBUDDY_API_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${GIFBUDDY_API_KEY}`
          }
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
      console.error('Error fetching GIFs from API:', error)
      return []
    }
  }

  getRecentGifsCache(): GifData[] {
    return this.recentGifsCache
  }
}

const gifService = new GifService()
export default gifService
