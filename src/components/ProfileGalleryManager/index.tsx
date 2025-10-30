import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import Uploader from '@/components/PostEditor/Uploader'
import { TGalleryImage } from '@/types'
import { ExternalLink, Loader, Trash2, Upload, X, ImagePlus } from 'lucide-react'
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface ProfileGalleryManagerProps {
  gallery: TGalleryImage[]
  onChange: (gallery: TGalleryImage[]) => void
}

export default function ProfileGalleryManager({ gallery, onChange }: ProfileGalleryManagerProps) {
  const { t } = useTranslation()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingImage, setEditingImage] = useState<TGalleryImage | null>(null)
  const [uploadingCount, setUploadingCount] = useState(0)
  const galleryRef = useRef(gallery)

  // Keep ref in sync with gallery prop
  galleryRef.current = gallery

  const handleAddImage = (url: string) => {
    // Use the ref to get the latest gallery state
    const newGallery = [...galleryRef.current, { url }]
    onChange(newGallery)
  }

  const handleRemoveImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index)
    onChange(newGallery)
  }

  const handleEditImage = (index: number) => {
    setEditingIndex(index)
    setEditingImage({ ...gallery[index] })
  }

  const normalizeUrl = (url: string): string => {
    if (!url) return ''
    const trimmed = url.trim()
    if (!trimmed) return ''

    // If it already has a protocol, return as-is
    if (trimmed.match(/^https?:\/\//i)) {
      return trimmed
    }

    // Add https:// prefix
    return `https://${trimmed}`
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingImage) {
      const newGallery = [...gallery]
      const normalizedLink = editingImage.link ? normalizeUrl(editingImage.link) : undefined

      // Normalize the link URL before saving
      newGallery[editingIndex] = {
        ...editingImage,
        link: normalizedLink
      }

      onChange(newGallery)
      setEditingIndex(null)
      setEditingImage(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingImage(null)
  }

  const handleUploadSuccess = ({ url }: { url: string }) => {
    handleAddImage(url)
  }

  const handleUploadStart = (file: File) => {
    setUploadingCount((prev) => prev + 1)
  }

  const handleUploadEnd = (file: File) => {
    setUploadingCount((prev) => prev - 1)
  }

  return (
    <div className="grid gap-4">
      <div>
        <Label>{t('Profile Gallery')}</Label>
        <p className="text-xs text-muted-foreground mt-1">
          {t(
            'Add images to your profile gallery. Click on an image to add a description and optional link.'
          )}
        </p>
      </div>

      {/* Upload Area - Full Width */}
      <Uploader
        onUploadSuccess={handleUploadSuccess}
        onUploadStart={handleUploadStart}
        onUploadEnd={handleUploadEnd}
        className={cn(
          'border-2 border-dashed border-muted-foreground/25 rounded-lg',
          'hover:border-muted-foreground/50 transition-colors cursor-pointer',
          'bg-muted/20 hover:bg-muted/40'
        )}
      >
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          {uploadingCount > 0 ? (
            <>
              <Loader className="w-10 h-10 animate-spin mb-3" />
              <p className="text-sm">
                {t('Uploading')} {uploadingCount} {uploadingCount === 1 ? t('image') : t('images')}
                ...
              </p>
            </>
          ) : (
            <>
              <ImagePlus className="w-10 h-10 mb-3" />
              <p className="text-base font-medium mb-1">{t('Upload Images')}</p>
              <p className="text-sm text-center">
                {t('Click to select or drag and drop')}
                <br />
                <span className="text-xs">{t('You can select multiple images at once')}</span>
              </p>
            </>
          )}
        </div>
      </Uploader>

      {/* Gallery Grid */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {gallery.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-md group bg-muted"
            >
              <img
                src={image.url}
                alt={image.description || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className={cn(
                  'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100',
                  'transition-opacity flex items-center justify-center gap-2'
                )}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8"
                  onClick={() => handleEditImage(index)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8"
                  onClick={() => handleRemoveImage(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {image.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs line-clamp-2">{image.description}</p>
                </div>
              )}
              {image.link && (
                <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1 rounded">
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editingIndex !== null} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Edit Gallery Image')}</DialogTitle>
            <DialogDescription>
              {t('Add a description and optional link to this image.')}
            </DialogDescription>
          </DialogHeader>
          {editingImage && (
            <div className="grid gap-4 py-4">
              <div className="aspect-square w-full rounded-md overflow-hidden bg-muted">
                <img
                  src={editingImage.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gallery-description">{t('Description (optional)')}</Label>
                <Textarea
                  id="gallery-description"
                  placeholder={t('Describe this image...')}
                  value={editingImage.description || ''}
                  onChange={(e) =>
                    setEditingImage({ ...editingImage, description: e.target.value })
                  }
                  className="h-24"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gallery-link">{t('Link (optional)')}</Label>
                <Input
                  id="gallery-link"
                  type="url"
                  placeholder={t('https://example.com')}
                  value={editingImage.link || ''}
                  onChange={(e) => {
                    setEditingImage({ ...editingImage, link: e.target.value })
                  }}
                />
                {editingImage.link && (
                  <p className="text-xs text-muted-foreground">
                    Will be saved as: {normalizeUrl(editingImage.link)}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              {t('Cancel')}
            </Button>
            <Button onClick={handleSaveEdit}>{t('Save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
