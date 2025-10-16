import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { Music, Pause, Play, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface EntranceMusicPlayerProps {
  url: string
  onDismiss: () => void
  className?: string
}

export default function EntranceMusicPlayer({
  url,
  onDismiss,
  className
}: EntranceMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const youtubePlayerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(false)
  const [isYoutube, setIsYoutube] = useState(false)
  const seekTimeoutRef = useRef<NodeJS.Timeout>()
  const isSeeking = useRef(false)

  useEffect(() => {
    // Check if URL is YouTube
    const youtubePattern =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([^&\n?#]+)/
    const match = url.match(youtubePattern)

    if (match) {
      setIsYoutube(true)
      const videoId = match[1].trim()
      initYoutubePlayer(videoId)
    } else {
      setIsYoutube(false)
      initAudioPlayer()
    }

    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy()
      }
    }
  }, [url])

  const initYoutubePlayer = (videoId: string) => {
    if (!containerRef.current) return

    if (!window.YT) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(script)

      window.onYouTubeIframeAPIReady = () => {
        createYoutubePlayer(videoId)
      }
    } else {
      createYoutubePlayer(videoId)
    }
  }

  const createYoutubePlayer = (videoId: string) => {
    if (!containerRef.current) return

    try {
      // Create a hidden div for the YouTube player
      const playerDiv = document.createElement('div')
      playerDiv.id = `youtube-player-${Date.now()}`
      playerDiv.style.display = 'none'
      containerRef.current.appendChild(playerDiv)

      let updateInterval: NodeJS.Timeout | null = null

      youtubePlayerRef.current = new window.YT.Player(playerDiv.id, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false)
            }
          },
          onReady: (event: any) => {
            try {
              const player = event.target
              player.playVideo()
              setDuration(player.getDuration())

              // Update current time periodically
              updateInterval = setInterval(() => {
                try {
                  if (youtubePlayerRef.current && !isSeeking.current) {
                    const currentTime = youtubePlayerRef.current.getCurrentTime()
                    if (typeof currentTime === 'number' && !isNaN(currentTime)) {
                      setCurrentTime(currentTime)
                    }
                  }
                } catch (err) {
                  // Ignore errors when player is not ready
                }
              }, 500)
            } catch (err) {
              console.error('Error in onReady:', err)
              setError(true)
            }
          },
          onError: () => setError(true)
        }
      })

      // Cleanup function
      return () => {
        if (updateInterval) {
          clearInterval(updateInterval)
        }
      }
    } catch (error) {
      console.error('Failed to initialize YouTube player:', error)
      setError(true)
    }
  }

  const initAudioPlayer = () => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      if (!isSeeking.current) {
        setCurrentTime(audio.currentTime)
      }
    }
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handlePause = () => setIsPlaying(false)
    const handlePlay = () => setIsPlaying(true)
    const handleCanPlay = () => {
      // Auto-play once the audio is ready
      audio.play().catch((err) => {
        console.error('Failed to autoplay:', err)
        // If autoplay fails, just set playing state to false
        setIsPlaying(false)
      })
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }

  const togglePlay = () => {
    if (isYoutube && youtubePlayerRef.current) {
      try {
        if (isPlaying) {
          youtubePlayerRef.current.pauseVideo()
        } else {
          youtubePlayerRef.current.playVideo()
        }
      } catch (err) {
        console.error('Error toggling YouTube playback:', err)
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const handleSeek = (value: number[]) => {
    isSeeking.current = true
    setCurrentTime(value[0])

    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current)
    }

    seekTimeoutRef.current = setTimeout(() => {
      if (isYoutube && youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.seekTo(value[0], true)
        } catch (err) {
          console.error('Error seeking YouTube video:', err)
        }
      } else if (audioRef.current) {
        audioRef.current.currentTime = value[0]
      }
      isSeeking.current = false
    }, 300)
  }

  if (error) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-3 py-3 px-4 border rounded-lg bg-background shadow-lg max-w-sm',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {!isYoutube && (
        <audio ref={audioRef} src={url} preload="metadata" onError={() => setError(true)} />
      )}

      {/* Music Icon */}
      <div className="shrink-0">
        <Music className="h-5 w-5 text-primary" />
      </div>

      {/* Play/Pause Button */}
      <Button size="icon" variant="outline" className="rounded-full shrink-0 h-8 w-8" onClick={togglePlay}>
        {isPlaying ? (
          <Pause className="h-4 w-4" fill="currentColor" />
        ) : (
          <Play className="h-4 w-4" fill="currentColor" />
        )}
      </Button>

      {/* Progress Section */}
      <div className="flex-1 min-w-0">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          hideThumb
          enableHoverAnimation
          className="w-full"
        />
      </div>

      {/* Time Display */}
      <div className="text-xs font-mono text-muted-foreground shrink-0">
        {formatTime(Math.max(duration - currentTime, 0))}
      </div>

      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full shrink-0 h-8 w-8 text-muted-foreground"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

const formatTime = (time: number) => {
  if (time === Infinity || isNaN(time)) {
    return '-:--'
  }
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
