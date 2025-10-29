# Image Generation Preview Fix

## Problem

The `/image` command was generating images successfully, but the preview was not showing up before clicking "Insert Image". No image URL was being extracted from the API response, resulting in an empty string.

## Root Cause #1: API Response Format

The Google Gemini image generation model (`google/gemini-2.5-flash-image`) returns images in a different format than expected:

**Expected format:**
```json
{
  "choices": [{
    "message": {
      "content": "data:image/png;base64,..."
    }
  }]
}
```

**Actual format:**
```json
{
  "choices": [{
    "message": {
      "content": "",
      "images": [{
        "type": "image_url",
        "image_url": {
          "url": "data:image/png;base64,..."
        }
      }]
    }
  }]
}
```

The code was checking `message.content` (which was empty) instead of `message.images[0].image_url.url`.

## Root Cause #2: Image Component Compatibility

Even after extracting the URL, the `ImageCommandList` component was using the generic `Image` component to display the generated image preview. However, the `Image` component is specifically designed to handle:

1. **HTTP/HTTPS URLs** from standard web servers
2. **Nostr Blossom server URLs** with fallback logic
3. **Blurhash placeholders** for progressive loading

When given a data URL (base64 encoded image), the `Image` component's error handling logic would:
1. Try to parse it as a `URL` object
2. Attempt to extract a Blossom hash from it
3. Fail and hide the image with `hideIfError={true}`

## Solution

### 1. Support New API Response Format
Added check for the `images` array in the API response before checking `content`:

```tsx
// First check if there's an images array (new format)
if (message.images && Array.isArray(message.images) && message.images.length > 0) {
  const firstImage = message.images[0]
  if (firstImage.image_url?.url) {
    return firstImage.image_url.url
  }
}

// Fallback to old format (checking content)
if (Array.isArray(message.content)) {
  // ... existing logic
}
```

This makes the code compatible with both:
- **New format**: Google Gemini models that use `message.images[]`
- **Old format**: Models that put the URL directly in `message.content`

### 2. Auto-Upload to Media Server

Instead of inserting the raw base64 data URL (which can be 50,000+ characters), we now:

```tsx
const handleUploadAndInsert = async () => {
  // Convert data URL to File
  const file = await dataUrlToFile(imageUrl, 'generated-image.png')

  // Upload to user's configured media server (Blossom or NIP-96)
  const result = await mediaUploadService.upload(file, {
    onProgress: (percent) => setUploadProgress(percent)
  })

  // Insert the uploaded URL
  props.command({ text: result.url })
}
```

Benefits:
- ✅ **Shorter posts**: URL instead of 50KB+ of base64
- ✅ **Better performance**: Images cached on media servers
- ✅ **WebP conversion**: Automatically optimized via media upload service
- ✅ **Progress indicator**: Shows upload progress to user
- ✅ **Uses existing config**: Works with user's media upload settings

### 3. Direct Data URL Rendering
For data URLs, we now use a native HTML `<img>` tag instead of the custom `Image` component:

```tsx
{imageUrl.startsWith('data:') ? (
  <img
    src={imageUrl}
    alt="Generated"
    className="w-full h-auto max-h-96 object-contain"
    onLoad={() => console.log('✓ Data URL image loaded successfully')}
    onError={(e) => console.error('✗ Data URL image failed to load:', e)}
  />
) : (
  <Image
    image={{ url: imageUrl }}
    className="w-full h-auto max-h-96 object-contain"
    hideIfError={false}
  />
)}
```

### 4. Improved Image Component Error Handling
Added special handling for data URLs in the `Image` component to fail fast:

```tsx
const handleError = async () => {
  // If it's a data URL, we can't recover from the error
  if (imageUrl.startsWith('data:')) {
    console.error('Data URL image failed to load')
    setIsLoading(false)
    setHasError(true)
    return
  }
  // ... rest of error handling for HTTP URLs
}
```

### 5. Enhanced Debugging
Added comprehensive console logging to track:
- Request/response details in `ai.service.ts`
- URL type detection (data URL vs HTTP URL)
- Image load success/failure events
- Preview rendering

## Result

Now when users type `/image a sunset`:

1. ✅ The API generates the image as a base64 data URL
2. ✅ The ImageCommandList receives the data URL from `message.images[]`
3. ✅ The preview is rendered using a native `<img>` tag
4. ✅ The image displays correctly before insertion
5. ✅ Users can see the image and click "Insert Image" or press Enter
6. ✅ The base64 image is converted to a File and uploaded to their media server
7. ✅ The uploaded URL (not the base64) is inserted into the post

## Image Format Support

The fix supports multiple image formats:

- **Base64 Data URLs**: `data:image/png;base64,...`
- **PNG**: `data:image/png;base64,...`
- **JPEG**: `data:image/jpeg;base64,...`
- **WebP**: `data:image/webp;base64,...`
- **HTTP URLs**: Still supported via the `Image` component

## Files Modified

1. `src/components/PostEditor/PostTextarea/ImageCommand/ImageCommandList.tsx`
   - Added conditional rendering for data URLs
   - Added logging for debugging

2. `src/components/Image/index.tsx`
   - Improved error handling for data URLs
   - Added logging for image load events

3. `src/services/ai.service.ts`
   - Added extensive logging for API requests/responses
   - Better error reporting

## Testing

To test the fix:

1. Configure AI settings with an OpenRouter API key
2. Select an image generation model (e.g., `google/gemini-2.5-flash-image`)
3. Configure a media upload service (Blossom or NIP-96)
4. Type `/image ` in the post editor
5. Enter a prompt like "a sunset over mountains"
6. Press Enter or click the generate button
7. ✅ Preview should display the generated image
8. ✅ Click "Insert Image" or press Enter
9. ✅ Image uploads to media server with progress bar
10. ✅ Uploaded URL (not base64) is inserted into post

## Important Notes

- **Media Upload Required**: You must have a media upload service configured
- **Auto WebP Conversion**: Images are automatically converted to WebP format
- **Blossom/NIP-96**: Works with either upload method
- **File Size**: Original base64 images are typically 50KB-500KB
- **Upload Time**: Usually 1-5 seconds depending on image size and server
