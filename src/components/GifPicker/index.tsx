import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import gifService, { GifData } from '@/services/gif.service'
import { ImagePlay, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface GifPickerProps {
  onGifSelect: (url: string) => void
  children?: React.ReactNode
}

function GifPickerContent({
  onGifClick,
  isSmallScreen
}: {
  onGifClick: (gif: GifData) => void
  isSmallScreen: boolean
}) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [gifs, setGifs] = useState<GifData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Determine how many GIFs to show based on screen size
  const gridCols = isSmallScreen ? 2 : 3
  const gifsToShow = isSmallScreen ? 6 : 12

  // Load recent GIFs on mount
  useEffect(() => {
    loadRecentGifs()
  }, [])

  const loadRecentGifs = async () => {
    setIsLoading(true)
    try {
      const recentGifs = await gifService.fetchRecentGifs(gifsToShow)
      setGifs(recentGifs)
    } catch (error) {
      console.error('Error loading recent GIFs:', error)
    } finally {
      setIsLoading(false)
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
      try {
        const results = await gifService.searchGifs(query, gifsToShow)
        setGifs(results)
      } catch (error) {
        console.error('Error searching GIFs:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }

  return (
    <div className="space-y-3 p-3">
      <Input
        placeholder={t('Search GIFs...')}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full"
        autoFocus={!isSmallScreen}
      />
      <ScrollArea className={isSmallScreen ? 'h-80' : 'h-64'}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : gifs.length > 0 ? (
          <div
            className="grid gap-2 pr-3"
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
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {searchQuery ? t('No GIFs found') : t('No recent GIFs')}
          </div>
        )}
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
          <GifPickerContent onGifClick={handleGifClick} isSmallScreen={isSmallScreen} />
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
        <GifPickerContent onGifClick={handleGifClick} isSmallScreen={isSmallScreen} />
      </PopoverContent>
    </Popover>
  )
}
