import client from './client.service'
import { Event, Filter } from 'nostr-tools'
import indexedDBService from './indexed-db.service'

const GIFBUDDY_RELAY = 'wss://relay.gifbuddy.lol'
const GIF_CACHE_STORE = 'gif-cache'
const CACHE_VERSION = 1
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

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
  createdAt?: number
}

export interface GifSearchResult {
  gifs: GifData[]
  hasMore: boolean
}

interface GifCache {
  gifs: GifData[]
  timestamp: number
  version: number
}

interface GifSearchCache {
  [query: string]: {
    gifs: GifData[]
    timestamp: number
  }
}

class GifService {
  private allGifsCache: Map<string, GifData> = new Map() // eventId -> GifData
  private searchCache: GifSearchCache = {}
  private isInitialized = false
  private initializationPromise: Promise<void> | null = null

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
      eventId: event.id,
      createdAt: event.created_at
    }
  }

  private async loadCacheFromIndexedDB(): Promise<void> {
    try {
      const cached = await indexedDBService.get<GifCache>(GIF_CACHE_STORE, 'all-gifs')
      if (cached && cached.version === CACHE_VERSION) {
        const age = Date.now() - cached.timestamp
        if (age < CACHE_EXPIRY) {
          console.log('[GifService] Loading', cached.gifs.length, 'GIFs from cache')
          cached.gifs.forEach((gif) => {
            if (gif.eventId) {
              this.allGifsCache.set(gif.eventId, gif)
            }
          })
        } else {
          console.log('[GifService] Cache expired, will fetch fresh data')
        }
      }
    } catch (error) {
      console.error('[GifService] Error loading cache:', error)
    }
  }

  private async saveCacheToIndexedDB(): Promise<void> {
    try {
      const cache: GifCache = {
        gifs: Array.from(this.allGifsCache.values()),
        timestamp: Date.now(),
        version: CACHE_VERSION
      }
      await indexedDBService.set(GIF_CACHE_STORE, 'all-gifs', cache)
      console.log('[GifService] Saved', cache.gifs.length, 'GIFs to cache')
    } catch (error) {
      console.error('[GifService] Error saving cache:', error)
    }
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return
    if (this.initializationPromise) return this.initializationPromise

    this.initializationPromise = (async () => {
      console.log('[GifService] Initializing...')
      await this.loadCacheFromIndexedDB()

      this.isInitialized = true
      console.log('[GifService] Initialized with', this.allGifsCache.size, 'GIFs from cache')

      // Start background fetching to grow the cache
      // Don't await - let it run in background
      this.backgroundFetchGifs()
    })()

    return this.initializationPromise
  }

  private async backgroundFetchGifs(): Promise<void> {
    try {
      // Fetch in batches to continuously grow the cache
      let batchNumber = 1
      let fetchedCount = 0
      const batchSize = 2000

      console.log('[GifService] Starting background fetch...')

      // Keep fetching until we stop getting new GIFs
      while (batchNumber <= 10) { // Max 10 batches = 20,000 GIFs
        const newGifs = await this.fetchAndCacheGifs(batchSize, batchNumber * batchSize)
        fetchedCount += newGifs

        if (newGifs < batchSize / 2) {
          // If we got less than half the batch size, we're probably done
          console.log('[GifService] Background fetch complete. Fetched', fetchedCount, 'new GIFs')
          break
        }

        console.log('[GifService] Batch', batchNumber, 'complete. Total cache:', this.allGifsCache.size)
        batchNumber++

        // Small delay between batches to not overwhelm the relay
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('[GifService] Background fetch error:', error)
    }
  }

  private async fetchAndCacheGifs(limit: number = 2000, offset: number = 0): Promise<number> {
    try {
      console.log('[GifService] Fetching up to', limit, 'GIFs from relay (offset:', offset, ')')

      // Build filter with offset by using 'until' timestamp if we have cached GIFs
      const filter: Filter = {
        kinds: [1063],
        limit
      }

      // If we have cached GIFs and this isn't the first batch, fetch older ones
      if (offset > 0 && this.allGifsCache.size > 0) {
        const cachedGifs = Array.from(this.allGifsCache.values())
        const oldestCached = cachedGifs.reduce((oldest, gif) =>
          (gif.createdAt || 0) < (oldest.createdAt || 0) ? gif : oldest
        )
        if (oldestCached.createdAt) {
          filter.until = oldestCached.createdAt - 1
        }
      }

      const events = await client.pool.querySync([GIFBUDDY_RELAY], filter) as GifEvent[]

      let newGifsCount = 0
      events.forEach((event) => {
        const gifData = this.gifEventToData(event)
        if (gifData && gifData.eventId && !this.allGifsCache.has(gifData.eventId)) {
          this.allGifsCache.set(gifData.eventId, gifData)
          newGifsCount++
        }
      })

      console.log('[GifService] Added', newGifsCount, 'new GIFs. Total cache:', this.allGifsCache.size)

      // Save to IndexedDB periodically
      if (newGifsCount > 0) {
        await this.saveCacheToIndexedDB()
      }

      return newGifsCount
    } catch (error) {
      console.error('[GifService] Error fetching GIFs:', error)
      return 0
    }
  }

  async fetchRecentGifs(limit: number = 24, offset: number = 0): Promise<GifSearchResult> {
    await this.initialize()

    // Get all GIFs sorted by created_at (most recent first)
    const sortedGifs = Array.from(this.allGifsCache.values())
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

    const gifs = sortedGifs.slice(offset, offset + limit)
    const hasMore = offset + limit < sortedGifs.length

    return {
      gifs,
      hasMore
    }
  }

  async searchGifs(query: string, limit: number = 24, offset: number = 0): Promise<GifSearchResult> {
    if (!query.trim()) {
      return this.fetchRecentGifs(limit, offset)
    }

    await this.initialize()

    const lowerQuery = query.toLowerCase()

    // Check if we have a recent search cache
    const cached = this.searchCache[query]
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes
      const gifs = cached.gifs.slice(offset, offset + limit)
      const hasMore = offset + limit < cached.gifs.length
      return { gifs, hasMore }
    }

    // Filter all cached GIFs
    const matchingGifs = Array.from(this.allGifsCache.values())
      .filter((gif) =>
        gif.alt?.toLowerCase().includes(lowerQuery) ||
        gif.url.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

    // Cache the search results
    this.searchCache[query] = {
      gifs: matchingGifs,
      timestamp: Date.now()
    }

    const gifs = matchingGifs.slice(offset, offset + limit)
    const hasMore = offset + limit < matchingGifs.length

    console.log('[GifService] Search for "' + query + '" found', matchingGifs.length, 'GIFs')

    return {
      gifs,
      hasMore
    }
  }

  async refreshCache(): Promise<void> {
    console.log('[GifService] Refreshing cache...')
    await this.backgroundFetchGifs()
  }

  getCacheSize(): number {
    return this.allGifsCache.size
  }

  async clearCache(): Promise<void> {
    this.allGifsCache.clear()
    this.searchCache = {}
    await indexedDBService.delete(GIF_CACHE_STORE, 'all-gifs')
    this.isInitialized = false
    this.initializationPromise = null
    console.log('[GifService] Cache cleared')
  }

  // Force fetch more GIFs manually
  async fetchMoreGifs(): Promise<number> {
    await this.initialize()
    return this.fetchAndCacheGifs(2000, this.allGifsCache.size)
  }
}

const gifService = new GifService()
export default gifService
