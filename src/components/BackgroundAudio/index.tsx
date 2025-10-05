import { useScreenSize } from '@/providers/ScreenSizeProvider'
import mediaManager from '@/services/media-manager.service'
import { useEffect, useState } from 'react'
import AudioPlayer from '../AudioPlayer'

export default function BackgroundAudio() {
  const { isSmallScreen } = useScreenSize()
  const [backgroundAudioSrc, setBackgroundAudioSrc] = useState<string | null>(null)
  const [backgroundAudio, setBackgroundAudio] = useState<React.ReactNode>(null)

  useEffect(() => {
    const handlePlayAudioBackground = (event: Event) => {
      const { src, time } = (event as CustomEvent).detail
      if (backgroundAudioSrc === src) return

      setBackgroundAudio(
        <AudioPlayer
          src={src}
          className={isSmallScreen ? 'rounded-none border-none' : ''}
          startTime={time}
          autoPlay
          isMinimized
        />
      )
      setBackgroundAudioSrc(src)
    }

    const handleStopAudioBackground = () => {
      setBackgroundAudio(null)
    }

    mediaManager.addEventListener('playAudioBackground', handlePlayAudioBackground)
    mediaManager.addEventListener('stopAudioBackground', handleStopAudioBackground)

    return () => {
      mediaManager.removeEventListener('playAudioBackground', handlePlayAudioBackground)
      mediaManager.removeEventListener('stopAudioBackground', handleStopAudioBackground)
    }
  }, [])

  return backgroundAudio
}
