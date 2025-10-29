import client from './client.service'
import { Event, Filter } from 'nostr-tools'

// Relays that may have GIF/file metadata events
const GIF_RELAYS = [
  'wss://relay.gifbuddy.lol',
  'wss://relay.nostr.band',
  'wss://nostr.wine',
  'wss://relay.damus.io',
  'wss://nos.lol'
]
const GIF_CACHE_KEY = 'jumble-gif-cache'
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
  private updateCallbacks: Set<() => void> = new Set()

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

  private loadCacheFromStorage(): void {
    try {
      const cachedString = localStorage.getItem(GIF_CACHE_KEY)
      if (!cachedString) return

      const cached = JSON.parse(cachedString) as GifCache
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
          localStorage.removeItem(GIF_CACHE_KEY)
        }
      }
    } catch (error) {
      console.error('[GifService] Error loading cache:', error)
      localStorage.removeItem(GIF_CACHE_KEY)
    }
  }

  private saveCacheToStorage(): void {
    try {
      const cache: GifCache = {
        gifs: Array.from(this.allGifsCache.values()),
        timestamp: Date.now(),
        version: CACHE_VERSION
      }
      localStorage.setItem(GIF_CACHE_KEY, JSON.stringify(cache))
      console.log('[GifService] Saved', cache.gifs.length, 'GIFs to cache')
    } catch (error) {
      console.error('[GifService] Error saving cache:', error)
      // If localStorage is full, try to clear old cache
      try {
        localStorage.removeItem(GIF_CACHE_KEY)
      } catch (e) {
        console.error('[GifService] Could not clear cache:', e)
      }
    }
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return
    if (this.initializationPromise) return this.initializationPromise

    this.initializationPromise = (async () => {
      console.log('[GifService] Initializing...')

      // Load cache synchronously from localStorage
      this.loadCacheFromStorage()

      this.isInitialized = true
      console.log('[GifService] Initialized with', this.allGifsCache.size, 'GIFs from cache')

      // Start fetching immediately - don't wait for cache to be big enough
      // This ensures we get fresh GIFs even on first load
      this.backgroundFetchGifs()
    })()

    return this.initializationPromise
  }

  private async backgroundFetchGifs(): Promise<void> {
    try {
      console.log('[GifService] Starting background fetch...')

      // First fetch - get a good initial batch immediately
      let fetchedCount = await this.fetchAndCacheGifs(2000)
      console.log('[GifService] Initial batch fetched:', fetchedCount, 'GIFs')

      // Continue fetching more batches if we got a full batch
      let batchNumber = 2
      const batchSize = 2000

      while (batchNumber <= 10 && fetchedCount >= batchSize / 2) {
        // Small delay between batches to not overwhelm the relay
        await new Promise(resolve => setTimeout(resolve, 2000))

        const newGifs = await this.fetchAndCacheGifs(batchSize)
        fetchedCount = newGifs

        console.log('[GifService] Batch', batchNumber, 'complete. New GIFs:', newGifs, 'Total cache:', this.allGifsCache.size)
        batchNumber++
      }

      console.log('[GifService] Background fetch complete. Total cache:', this.allGifsCache.size, 'GIFs')
    } catch (error) {
      console.error('[GifService] Background fetch error:', error)
    }
  }

  private async fetchAndCacheGifs(limit: number = 2000): Promise<number> {
    try {
      console.log('[GifService] Fetching up to', limit, 'GIFs from', GIF_RELAYS.length, 'relays')

      // Build filter - if we have cached GIFs, fetch older ones
      const filter: Filter = {
        kinds: [1063],
        limit
      }

      // If we have cached GIFs, fetch older ones using 'until'
      if (this.allGifsCache.size > 0) {
        const cachedGifs = Array.from(this.allGifsCache.values())
        const oldestCached = cachedGifs.reduce((oldest, gif) =>
          (gif.createdAt || 0) < (oldest.createdAt || 0) ? gif : oldest
        )
        if (oldestCached.createdAt) {
          filter.until = oldestCached.createdAt - 1
          console.log('[GifService] Fetching GIFs older than', new Date(oldestCached.createdAt * 1000))
        }
      }

      console.log('[GifService] Query filter:', JSON.stringify(filter))

      const events = await client.pool.querySync(GIF_RELAYS, filter) as GifEvent[]

      console.log('[GifService] Received', events.length, 'events from relay')

      if (events.length > 0) {
        console.log('[GifService] Sample event:', events[0])
      }

      let newGifsCount = 0
      let filteredOut = 0
      events.forEach((event) => {
        const gifData = this.gifEventToData(event)
        if (gifData) {
          if (gifData.eventId && !this.allGifsCache.has(gifData.eventId)) {
            this.allGifsCache.set(gifData.eventId, gifData)
            newGifsCount++
          }
        } else {
          filteredOut++
        }
      })

      console.log('[GifService] Processed:', newGifsCount, 'new GIFs,', filteredOut, 'filtered out. Total cache:', this.allGifsCache.size)

      // Save to localStorage and notify subscribers if we got new GIFs
      if (newGifsCount > 0) {
        this.saveCacheToStorage()
        this.notifyCacheUpdate()
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
    localStorage.removeItem(GIF_CACHE_KEY)
    this.isInitialized = false
    this.initializationPromise = null
    console.log('[GifService] Cache cleared')
  }

  // Force fetch more GIFs manually
  async fetchMoreGifs(): Promise<number> {
    await this.initialize()
    return this.fetchAndCacheGifs(2000)
  }

  // Subscribe to cache updates
  onCacheUpdate(callback: () => void): () => void {
    this.updateCallbacks.add(callback)
    // Return unsubscribe function
    return () => {
      this.updateCallbacks.delete(callback)
    }
  }

  // Notify all subscribers of cache update
  private notifyCacheUpdate(): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('[GifService] Error in update callback:', error)
      }
    })
  }
}

const gifService = new GifService()
export default gifService
