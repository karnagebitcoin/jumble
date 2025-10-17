import { TGalleryImage } from '@/types'
import { ExternalLink } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import modalManager from '@/services/modal-manager.service'
import { randomString } from '@/lib/random'
import { cn } from '@/lib/utils'

interface ProfileGalleryProps {
  gallery: TGalleryImage[]
  maxRows?: number
}

export default function ProfileGallery({ gallery, maxRows = 3 }: ProfileGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const lightboxId = useMemo(() => `profile-gallery-lightbox-${randomString()}`, [])

  // Limit gallery images to maxRows * 3 columns
  const visibleGallery = useMemo(() => {
    return gallery.slice(0, maxRows * 3)
  }, [gallery, maxRows])

  const slides = useMemo(() => {
    return visibleGallery.map((image) => ({
      src: image.url,
      description: image.description
    }))
  }, [visibleGallery])

  useEffect(() => {
    if (lightboxIndex >= 0) {
      modalManager.register(lightboxId, () => {
        setLightboxIndex(-1)
      })
    } else {
      modalManager.unregister(lightboxId)
    }
  }, [lightboxIndex, lightboxId])

  const handleImageClick = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  if (!gallery || gallery.length === 0) {
    return null
  }

  return (
    <>
      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Gallery</h3>
        <div className="grid grid-cols-3 gap-2">
          {visibleGallery.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-md cursor-pointer group bg-muted"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={image.url}
                alt={image.description || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              {image.link && (
                <a
                  href={image.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm',
                    'p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-background/90 z-10'
                  )}
                  onClick={(e) => e.stopPropagation()}
                  title="Open link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {image.description && (
                <div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent',
                    'p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity'
                  )}
                >
                  <p className="line-clamp-2">{image.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {lightboxIndex >= 0 &&
        createPortal(
          <div onClick={(e) => e.stopPropagation()}>
            <Lightbox
              index={lightboxIndex}
              slides={slides}
              plugins={[Zoom]}
              open={lightboxIndex >= 0}
              close={() => setLightboxIndex(-1)}
              controller={{
                closeOnBackdropClick: true,
                closeOnPullUp: true,
                closeOnPullDown: true
              }}
              styles={{
                toolbar: { paddingTop: '2.25rem' }
              }}
              render={{
                slide: ({ slide }) => (
                  <div className="flex flex-col items-center justify-center h-full">
                    <img
                      src={slide.src}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                    />
                    {slide.description && (
                      <div className="mt-4 text-center text-white max-w-2xl px-4">
                        <p>{slide.description}</p>
                      </div>
                    )}
                    {visibleGallery[lightboxIndex]?.link && (
                      <a
                        href={visibleGallery[lightboxIndex].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Visit link</span>
                      </a>
                    )}
                  </div>
                )
              }}
            />
          </div>,
          document.body
        )}
    </>
  )
}
