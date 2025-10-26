import {
  Conversion,
  Input,
  Output,
  BlobSource,
  BufferTarget,
  ALL_FORMATS,
  Mp4OutputFormat
} from 'mediabunny'

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

      // Create a buffer target to hold the output in memory
      const target = new BufferTarget()

      // Create MP4 output format
      const format = new Mp4OutputFormat()

      // Create output
      const output = new Output({
        format,
        target
      })

      // Initialize the conversion with video and audio encoding options
      const conversion = await Conversion.init({
        input,
        output,
        video: {
          codec: 'h264',
          // Set a reasonable bitrate for ~80% quality
          // For 1080p video, 5 Mbps is good; for 720p, 2.5 Mbps
          // We'll use a quality-based approach with CRF-like bitrate
          bitrate: 5_000_000 // 5 Mbps
        },
        audio: {
          codec: 'aac',
          // 128kbps is good quality for most content
          bitrate: 128_000
        }
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

      // Finalize the output to complete the file
      await output.finalize()

      // Get the buffer from the target
      if (!target.buffer) {
        throw new Error('Output buffer is null')
      }

      // Convert buffer to File with appropriate name and type
      const fileName = file.name.replace(/\.[^/.]+$/, '.mp4')
      const compressedFile = new File([target.buffer], fileName, {
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
