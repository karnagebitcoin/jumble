# Image Generation Preview Fix

## Problem

The `/image` command was generating images successfully, but the preview was not showing up before clicking "Insert Image". The images were being generated as base64 data URLs (e.g., `data:image/png;base64,iVBORw0KGgo...`), but they weren't being displayed in the preview pane.

## Root Cause

The `ImageCommandList` component was using the generic `Image` component to display the generated image preview. However, the `Image` component is specifically designed to handle:

1. **HTTP/HTTPS URLs** from standard web servers
2. **Nostr Blossom server URLs** with fallback logic
3. **Blurhash placeholders** for progressive loading

When given a data URL (base64 encoded image), the `Image` component's error handling logic would:
1. Try to parse it as a `URL` object
2. Attempt to extract a Blossom hash from it
3. Fail and hide the image with `hideIfError={true}`

## Solution

### 1. Direct Data URL Rendering
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

### 2. Improved Image Component Error Handling
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

### 3. Enhanced Debugging
Added comprehensive console logging to track:
- Request/response details in `ai.service.ts`
- URL type detection (data URL vs HTTP URL)
- Image load success/failure events
- Preview rendering

## Result

Now when users type `/image a sunset`:

1. ✅ The API generates the image as a base64 data URL
2. ✅ The ImageCommandList receives the data URL
3. ✅ The preview is rendered using a native `<img>` tag
4. ✅ The image displays correctly before insertion
5. ✅ Users can see the image, then click "Insert Image" or press Enter

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
2. Select an image generation model
3. Type `/image ` in the post editor
4. Enter a prompt like "a sunset over mountains"
5. Press Enter or click the generate button
6. ✅ Preview should now display the generated image
7. ✅ Click "Insert Image" or press Enter to insert into post
