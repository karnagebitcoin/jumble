import { TGalleryImage } from '@/types'
import { ExternalLink } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import modalManager from '@/services/modal-manager.service'
import { randomString } from '@/lib/random'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProfileGalleryProps {
  gallery: TGalleryImage[]
  maxImages?: number
}

export default function ProfileGallery({ gallery, maxImages = 8 }: ProfileGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const lightboxId = useMemo(() => `profile-gallery-lightbox-${randomString()}`, [])

  // Limit gallery images to maxImages (default 8 for 4x2 grid)
  const visibleGallery = useMemo(() => {
    return gallery.slice(0, maxImages)
  }, [gallery, maxImages])

  const slides = useMemo(() => {
    return visibleGallery.map((image, index) => ({
      src: image.url,
      description: image.description,
      link: image.link,
      index: index
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
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Gallery</h3>
          <Badge variant="secondary" className="text-xs">
            {gallery.length}
          </Badge>
        </div>
        <div className="grid grid-cols-4 gap-2">
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
              <div
                className={cn(
                  'absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity',
                  'flex items-center justify-center'
                )}
              >
                <div className="text-white text-xs">View</div>
              </div>
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
                slide: ({ slide }) => {
                  // Use the slide's stored index to get the correct image data
                  const currentImage = visibleGallery[slide.index]
                  console.log('Rendering slide:', slide.index, 'Image data:', currentImage)
                  return (
                    <div className="flex flex-col items-center justify-center h-full w-full p-4">
                      <div className="relative max-w-full max-h-full flex items-center justify-center">
                        <img
                          src={slide.src}
                          alt=""
                          className="max-w-full max-h-[80vh] object-contain"
                        />
                        {currentImage?.description && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 pt-12">
                            <p className="text-white text-base text-center max-w-3xl mx-auto">
                              {currentImage.description}
                            </p>
                          </div>
                        )}
                      </div>
                      {currentImage?.link && (
                        <div className="mt-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('Opening link:', currentImage.link)
                              window.open(currentImage.link, '_blank', 'noopener,noreferrer')
                            }}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Visit Link</span>
                          </Button>
                        </div>
                      )}
                      {!currentImage?.link && (
                        <div className="mt-4 text-white text-sm opacity-50">
                          No link available
                        </div>
                      )}
                    </div>
                  )
                }
              }}
            />
          </div>,
          document.body
        )}
    </>
  )
}
