import * as MediaBunny from 'mediabunny'

class VideoCompressionService {
  static instance: VideoCompressionService

  constructor() {
    if (!VideoCompressionService.instance) {
      VideoCompressionService.instance = this
    }
    return VideoCompressionService.instance
  }

  /**
   * Compress a video file to a web-friendly format (MP4/H264)
   * @param file - The video file to compress
   * @param onProgress - Optional callback for progress updates (0-100)
   * @returns Compressed video file
   */
  async compressVideo(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<File> {
    // Check if the file is actually a video
    if (!file.type.startsWith('video/')) {
      return file
    }

    try {
      // Create an encoder instance
      const encoder = new MediaBunny.Encoder()

      // Prepare the encoder with web-friendly settings
      // Using H264 codec for maximum compatibility
      // Quality 80% (CRF 23 is a good balance - lower CRF = higher quality)
      await encoder.prepare({
        input: file,
        output: {
          // Use MP4 container format (most web-friendly)
          container: 'mp4',
          video: {
            codec: 'h264',
            // CRF 23 gives approximately 80% quality with good compression
            // CRF scale: 0 (lossless) to 51 (worst quality)
            // 18-28 is the recommended range, 23 is the default
            crf: 23,
            // Use baseline profile for maximum compatibility
            profile: 'baseline',
            // Optimize for web streaming (faststart flag will be added by container)
            preset: 'medium'
          },
          audio: {
            codec: 'aac',
            // 128kbps is good quality for most content
            bitrate: 128000
          }
        }
      })

      // Set up progress tracking
      if (onProgress) {
        encoder.on('progress', (progress) => {
          // mediabunny returns progress as 0-1, convert to 0-100
          onProgress(Math.round(progress * 100))
        })
      }

      // Start encoding
      const blob = await encoder.encode()

      // Clean up the encoder
      encoder.dispose()

      // Convert blob to File with appropriate name and type
      const fileName = file.name.replace(/\.[^/.]+$/, '.mp4')
      const compressedFile = new File([blob], fileName, {
        type: 'video/mp4',
        lastModified: Date.now()
      })

      // Log compression results
      console.log('Video compression complete:', {
        originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
        compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB',
        reduction: (((file.size - compressedFile.size) / file.size) * 100).toFixed(1) + '%'
      })

      return compressedFile
    } catch (error) {
      console.error('Error compressing video, using original file:', error)
      // If compression fails, return the original file
      return file
    }
  }

  /**
   * Check if a file should be compressed
   * @param file - The file to check
   * @returns true if the file is a video that should be compressed
   */
  shouldCompress(file: File): boolean {
    return file.type.startsWith('video/')
  }
}

const instance = new VideoCompressionService()
export default instance
