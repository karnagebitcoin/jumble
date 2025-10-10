import { cn } from '@/lib/utils'
import { useContentPolicy } from '@/providers/ContentPolicyProvider'
import mediaManager from '@/services/media-manager.service'
import { YouTubePlayer } from '@/types/youtube'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ExternalLink from '../ExternalLink'

export default function YoutubeEmbeddedPlayer({
  url,
  className,
  mustLoad = false
}: {
  url: string
  className?: string
  mustLoad?: boolean
}) {
  const { t } = useTranslation()
  const { autoLoadMedia } = useContentPolicy()
  const [display, setDisplay] = useState(autoLoadMedia)
  const { videoId, isShort } = useMemo(() => parseYoutubeUrl(url), [url])
  const [initSuccess, setInitSuccess] = useState(false)
  const [error, setError] = useState(false)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoLoadMedia) {
      setDisplay(true)
    } else {
      setDisplay(false)
    }
  }, [autoLoadMedia])

  useEffect(() => {
    if (!videoId || !containerRef.current || (!mustLoad && !display)) return

    if (!window.YT) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(script)

      window.onYouTubeIframeAPIReady = () => {
        initPlayer()
      }
    } else {
      initPlayer()
    }

    function initPlayer() {
      try {
        if (!videoId || !containerRef.current || !window.YT.Player) return
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: videoId,
          playerVars: {
            mute: 1
          },
          events: {
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                mediaManager.play(playerRef.current)
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                mediaManager.pause(playerRef.current)
              }
            },
            onReady: () => {
              setInitSuccess(true)
            },
            onError: () => setError(true)
          }
        })
      } catch (error) {
        console.error('Failed to initialize YouTube player:', error)
        setError(true)
        return
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [videoId, display, mustLoad])

  if (error) {
    return <ExternalLink url={url} />
  }

  if (!mustLoad && !display) {
    return (
      <div
        className="text-primary hover:underline truncate w-fit cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          setDisplay(true)
        }}
      >
        [{t('Click to load YouTube video')}]
      </div>
    )
  }

  if (!videoId && !initSuccess) {
    return <ExternalLink url={url} />
  }
  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        isShort ? 'aspect-[9/16] max-h-[80vh] sm:max-h-[60vh]' : 'aspect-video max-h-[60vh]',
        className
      )}
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}

function parseYoutubeUrl(url: string) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/
  ]

  let videoId: string | null = null
  let isShort = false
  for (const [index, pattern] of patterns.entries()) {
    const match = url.match(pattern)
    if (match) {
      videoId = match[1].trim()
      isShort = index === 2 // Check if it's a short video
      break
    }
  }
  return { videoId, isShort }
}
