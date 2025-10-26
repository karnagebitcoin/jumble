import { Conversion, Input, Output, QUALITY_HIGH, BlobSource, ALL_FORMATS } from 'mediabunny'

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
  async compressVideo(file: File, onProgress?: (progress: number) => void): Promise<File> {
    // Check if the file is actually a video
    if (!file.type.startsWith('video/')) {
      return file
    }

    try {
      // Create a BlobSource from the video file
      const source = new BlobSource(file)

      // Create input from the source
      const input = new Input({
        source,
        formats: ALL_FORMATS
      })

      // Create output to MP4 format
      const output = Output.create('mp4', {
        video: {
          codec: 'h264',
          // Use QUALITY_HIGH which gives approximately 80% quality
          bitrate: QUALITY_HIGH
        },
        audio: {
          codec: 'aac',
          // 128kbps is good quality for most content
          bitrate: 128000
        }
      })

      // Initialize the conversion
      const conversion = await Conversion.init({
        input,
        output
      })

      // Set up progress tracking
      if (onProgress) {
        conversion.onProgress = (progress) => {
          // mediabunny returns progress as 0-1, convert to 0-100
          onProgress(Math.round(progress * 100))
        }
      }

      // Check if the conversion is valid
      if (!conversion.isValid) {
        console.error('Conversion is not valid:', conversion.discardedTracks)
        throw new Error('Video conversion is not valid')
      }

      // Execute the conversion
      await conversion.execute()

      // Get the blob from the output
      const blob = await output.complete()

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
