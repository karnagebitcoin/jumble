import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import gifService, { GifData } from '@/services/gif.service'
import { ImagePlay, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface GifPickerProps {
  onGifSelect: (url: string) => void
  children?: React.ReactNode
}

function GifPickerContent({
  onGifClick,
  isSmallScreen,
  onClose
}: {
  onGifClick: (gif: GifData) => void
  isSmallScreen: boolean
  onClose?: () => void
}) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [gifs, setGifs] = useState<GifData[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const offsetRef = useRef(0)

  // Determine how many GIFs to show based on screen size
  const gridCols = isSmallScreen ? 2 : 3
  const gifsPerPage = isSmallScreen ? 12 : 24

  // Load recent GIFs on mount
  useEffect(() => {
    loadRecentGifs()
  }, [])

  const loadRecentGifs = async () => {
    setIsLoading(true)
    offsetRef.current = 0
    try {
      const { gifs: recentGifs, hasMore: more } = await gifService.fetchRecentGifs(gifsPerPage, 0)
      setGifs(recentGifs)
      setHasMore(more)
      offsetRef.current = recentGifs.length
    } catch (error) {
      console.error('Error loading recent GIFs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreGifs = async () => {
    if (isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const { gifs: moreGifs, hasMore: more } = searchQuery
        ? await gifService.searchGifs(searchQuery, gifsPerPage, offsetRef.current)
        : await gifService.fetchRecentGifs(gifsPerPage, offsetRef.current)

      setGifs((prev) => [...prev, ...moreGifs])
      setHasMore(more)
      offsetRef.current += moreGifs.length
    } catch (error) {
      console.error('Error loading more GIFs:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      offsetRef.current = 0
      try {
        const { gifs: results, hasMore: more } = await gifService.searchGifs(query, gifsPerPage, 0)
        setGifs(results)
        setHasMore(more)
        offsetRef.current = results.length
      } catch (error) {
        console.error('Error searching GIFs:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder={t('Search GIFs...')}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1"
          autoFocus={!isSmallScreen}
        />
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {gifs.length > 0 && (
            <>
              {t('Showing {{count}} GIFs', { count: gifs.length })}
              {hasMore && ' • ' + t('More available')}
            </>
          )}
        </span>
        <span className="text-xs">
          {t('Cache: {{count}}', { count: gifService.getCacheSize() })}
        </span>
      </div>
      <ScrollArea className={isSmallScreen ? 'h-80' : 'h-96'} type="always">
        <div className="pr-3">
          {isLoading ? (
            <div className="flex items-center justify-center" style={{ minHeight: isSmallScreen ? '20rem' : '24rem' }}>
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : gifs.length > 0 ? (
            <div className="space-y-3">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`
                }}
              >
                {gifs.map((gif, index) => (
                  <button
                    key={gif.eventId || `${gif.url}-${index}`}
                    onClick={() => onGifClick(gif)}
                    className="relative aspect-square overflow-hidden rounded-md border border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    title={gif.alt}
                  >
                    <img
                      src={gif.previewUrl || gif.url}
                      alt={gif.alt || 'GIF'}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMoreGifs}
                    disabled={isLoadingMore}
                    className="w-full"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('Loading...')}
                      </>
                    ) : (
                      t('Load More')
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ minHeight: isSmallScreen ? '20rem' : '24rem' }}>
              {searchQuery ? t('No GIFs found') : t('No recent GIFs')}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default function GifPicker({ onGifSelect, children }: GifPickerProps) {
  const { t } = useTranslation()
  const { isSmallScreen } = useScreenSize()
  const [open, setOpen] = useState(false)

  const handleGifClick = (gif: GifData) => {
    onGifSelect(gif.url)
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
  }

  if (isSmallScreen) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {children || (
            <Button variant="ghost" size="icon" title={t('Add GIF')}>
              <ImagePlay />
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent>
          <GifPickerContent
            onGifClick={handleGifClick}
            isSmallScreen={isSmallScreen}
            onClose={handleClose}
          />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" title={t('Add GIF')}>
            <ImagePlay />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[560px] p-0" align="start" side="top">
        <GifPickerContent
          onGifClick={handleGifClick}
          isSmallScreen={isSmallScreen}
          onClose={handleClose}
        />
      </PopoverContent>
    </Popover>
  )
}
