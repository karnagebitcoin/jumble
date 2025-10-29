import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useNostr } from '@/providers/NostrProvider'
import mediaUploadService from '@/services/media-upload.service'
import gifService from '@/services/gif.service'
import client from '@/services/client.service'
import { BIG_RELAY_URLS } from '@/constants'
import { Loader2, Upload, X, CheckCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex } from '@noble/hashes/utils'
import AlertCard from '@/components/AlertCard'

interface GifUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function GifUploadDialog({ open, onOpenChange, onSuccess }: GifUploadDialogProps) {
  const { t } = useTranslation()
  const { pubkey, signEvent } = useNostr()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setError('')
    setSuccess('')

    // Validate file type
    if (!selectedFile.type.includes('gif')) {
      setError(t('Please select a GIF file'))
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(t('Please select a GIF smaller than 10MB'))
      return
    }

    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(null)
    setPreviewUrl('')
    setError('')
    setSuccess('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    setError('')
    setSuccess('')

    if (!file) {
      setError(t('Please select a file'))
      return
    }

    if (!pubkey) {
      setError(t('Please log in to upload GIFs'))
      return
    }

    if (!description.trim()) {
      setError(t('Please add a description to help others find your GIF'))
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Upload the file
      const uploadResult = await mediaUploadService.upload(file, {
        onProgress: (percent) => {
          setUploadProgress(percent)
        }
      })

      // Calculate hash
      const arrayBuffer = await file.arrayBuffer()
      const hashBytes = sha256(new Uint8Array(arrayBuffer))
      const hash = bytesToHex(hashBytes)

      // Create kind 1063 event
      const tags: string[][] = [
        ['url', uploadResult.url],
        ['m', file.type],
        ['x', hash],
        ['size', String(file.size)],
        ['alt', description.trim()]
      ]

      // Add any additional tags from upload result
      if (uploadResult.tags && uploadResult.tags.length > 0) {
        uploadResult.tags.forEach(tag => {
          // Don't duplicate url, m, x, size, or alt tags
          if (!['url', 'm', 'x', 'size', 'alt'].includes(tag[0])) {
            tags.push(tag)
          }
        })
      }

      const event = await signEvent({
        kind: 1063,
        content: description.trim(),
        created_at: Math.floor(Date.now() / 1000),
        tags
      })

      // Publish to relays (gifbuddy.lol relay + big relays)
      await client.publishEvent(
        ['wss://relay.gifbuddy.lol', ...BIG_RELAY_URLS],
        event
      )

      // Add to local cache
      await gifService.addUserGif({
        url: uploadResult.url,
        alt: description.trim(),
        size: String(file.size),
        hash,
        eventId: event.id,
        createdAt: event.created_at,
        pubkey
      })

      setSuccess(t('Your GIF has been uploaded successfully and is now available in "My Gifs"'))

      // Reset form and close after a short delay
      setTimeout(() => {
        handleRemoveFile()
        setDescription('')
        onSuccess?.()
      }, 1500)
    } catch (error) {
      console.error('Error uploading GIF:', error)
      setError(error instanceof Error ? error.message : t('Failed to upload GIF'))
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      handleRemoveFile()
      setDescription('')
      setError('')
      setSuccess('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('Upload GIF')}</DialogTitle>
          <DialogDescription>
            {t('Upload a GIF to share with the Nostr community. It will be published as a kind 1063 event.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <AlertCard title={t('Error')} content={error} />
          )}

          {success && (
            <div className="p-3 rounded-lg text-sm bg-green-100/20 dark:bg-green-950/20 border border-green-500 text-green-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <div className="font-medium">{success}</div>
              </div>
            </div>
          )}

          {!file ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                {t('Click to select a GIF file')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('Max size: 10MB')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full rounded-lg border border-border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">
              {t('Description')} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder={t('Describe your GIF to help others find it (e.g., "happy cat dancing")')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {t('This description will be used for searching and accessibility')}
            </p>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t('Uploading...')}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {t('Cancel')}
          </Button>
          <Button onClick={handleUpload} disabled={!file || !description.trim() || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('Uploading...')}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {t('Upload')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
