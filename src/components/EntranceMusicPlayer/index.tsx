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
  const youtubeIframeRef = useRef<HTMLIFrameElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(false)
  const [isYoutube, setIsYoutube] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const seekTimeoutRef = useRef<NodeJS.Timeout>()
  const isSeeking = useRef(false)
  const updateIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Check if URL is YouTube
    const youtubePattern =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([^&\n?#]+)/
    const match = url.match(youtubePattern)

    if (match) {
      setIsYoutube(true)
      setVideoId(match[1].trim())
    } else {
      setIsYoutube(false)
      initAudioPlayer()
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [url])

  // Handle YouTube iframe load
  useEffect(() => {
    if (!isYoutube || !youtubeIframeRef.current) return

    const iframe = youtubeIframeRef.current

    // Try to autoplay after a short delay to allow iframe to load
    const autoplayTimeout = setTimeout(() => {
      try {
        // Send postMessage to play the video
        iframe.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        )
        setIsPlaying(true)
      } catch (err) {
        console.error('Autoplay failed:', err)
      }
    }, 1000)

    // For YouTube, we'll estimate duration and time since we don't have API access
    // Set a default duration (most songs are ~3-5 minutes)
    setDuration(300) // 5 minutes default

    // Start a timer to track current time
    updateIntervalRef.current = setInterval(() => {
      if (isPlaying && !isSeeking.current) {
        setCurrentTime((prev) => {
          const next = prev + 1
          return next >= duration ? duration : next
        })
      }
    }, 1000)

    return () => {
      clearTimeout(autoplayTimeout)
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [isYoutube, isPlaying, duration])

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
    if (isYoutube && youtubeIframeRef.current) {
      try {
        const iframe = youtubeIframeRef.current
        if (isPlaying) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
            '*'
          )
          setIsPlaying(false)
        } else {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
            '*'
          )
          setIsPlaying(true)
        }
      } catch (err) {
        console.error('Error toggling YouTube playback:', err)
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((err) => {
          console.error('Error playing media:', err)
        })
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
      if (isYoutube && youtubeIframeRef.current) {
        try {
          const iframe = youtubeIframeRef.current
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'seekTo', args: [value[0], true] }),
            '*'
          )
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
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-3 py-3 px-4 border rounded-lg bg-background shadow-lg max-w-sm',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {!isYoutube && (
        <audio ref={audioRef} src={url} preload="metadata" onError={() => setError(true)} />
      )}

      {/* Hidden YouTube iframe */}
      {isYoutube && videoId && (
        <iframe
          ref={youtubeIframeRef}
          width="1"
          height="1"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&enablejsapi=1&origin=${window.location.origin}`}
          allow="autoplay; encrypted-media"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            opacity: 0,
            pointerEvents: 'none'
          }}
        />
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
