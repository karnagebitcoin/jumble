# AI Image Generation Feature

This feature extends the `/ai` command to automatically detect and handle image generation requests using the `google/gemini-2.5-flash-image` model.

## Usage

### Generating Images

1. **In the note composer, type `/ai`**
2. **Enter an image generation prompt**
   - Example: `image of a monkey`
   - Example: `create a picture of a sunset over mountains`
   - Example: `draw a futuristic city`
   - Example: `generate an illustration of a cat wearing a hat`

3. **Submit your prompt**
   - Click the arrow button (→) or press Enter
   - The system will automatically detect that you're requesting an image
   - You'll see "Generating..." while the image is being created

4. **Preview and insert**
   - The generated image will be displayed in a preview
   - Click "Insert Image" or press Enter to add the image URL to your note
   - Or click "Copy URL" to copy the image link to your clipboard

## How It Works

The feature intelligently detects image generation requests by looking for keywords like:
- **Action words**: image, picture, photo, drawing, illustration, generate, create, make, draw, paint
- **Context words**: of, about, for, showing, depicting

When both types of keywords are detected in your prompt, the system automatically:
1. Switches from your configured model to `google/gemini-2.5-flash-image`
2. Sends your prompt directly to the image generation model
3. Shows "Generating..." instead of "Thinking..." during processing
4. Displays the generated image in a preview card
5. Allows you to insert the image URL into your note

## Examples

### Simple Image Request
```
/ai image of a monkey
```
→ Generates an image of a monkey

### Detailed Image Request
```
/ai create a picture of a tropical beach at sunset with palm trees
```
→ Generates a detailed scene as described

### Illustration Request
```
/ai draw a cartoon character holding a bitcoin
```
→ Generates an illustration in a cartoon style

### Photo-Style Request
```
/ai generate a photo of a mountain landscape
```
→ Generates a realistic photo-style image

## Configuration

### AI Settings

In Settings → AI Tools, you now have two separate model configurations:

1. **Default Model**: Used for text generation, summaries, and general AI tasks
   - Default: `x-ai/grok-4-fast`
   - Used for regular `/ai` commands (non-image)

2. **Image Generation Model**: Used specifically for image generation requests
   - Default: `openai/gpt-5-image-mini`
   - Automatically used when you request images
   - Available options:
     - OpenAI GPT-5 Image Mini (default, fast and efficient)
     - OpenAI GPT-5 Image (higher quality)
     - Google Gemini 2.5 Flash Image

### Requirements

- Valid OpenRouter API key configured in AI Settings
- Both default and image models will be pre-configured with sensible defaults
- You can change either model independently

## Troubleshooting

If the image doesn't appear or you see "here you go" without an actual image:

1. **Check Browser Console**: Open your browser's developer tools (F12) and check the console for debug logs
   - Look for "Image generation response:" to see the raw API response
   - Look for "Content is array:" or "Content is string:" to see what format was received
   - Look for "Found image URL:" or "Extracted URL:" to see if a URL was detected

2. **Response Format**: The model may return the image in different formats:
   - As a URL in a structured `image_url` field
   - As a URL embedded in text
   - As a base64 data URL

3. **Debug Mode**: If the image URL can't be extracted, you'll see a debug view showing the raw response. This helps identify parsing issues.

4. **API Response**: The system logs the full API response to help diagnose any issues with the image generation service

## Benefits

- **Automatic Detection**: No need to manually switch models or use special commands
- **Seamless Experience**: Works just like regular `/ai` commands
- **Visual Feedback**: Shows "Generating..." to indicate image creation is in progress
- **Image Preview**: See the generated image before inserting it
- **Easy Insertion**: One click to add the image to your note

## Implementation Details

The feature adds intelligent detection to the existing `/ai` command:

- **Detection Logic**: Uses regex patterns to identify image generation requests
- **Model Switching**: Automatically uses `google/gemini-2.5-flash-image` when appropriate
- **State Management**: Tracks whether an image is being generated to show appropriate UI
- **Image Display**: Shows generated images in a preview card with insert/copy options
- **URL Handling**: Automatically extracts and handles image URLs from the response

Modified files:
- `src/components/PostEditor/PostTextarea/AICommand/AICommandList.tsx`
- `src/services/ai.service.ts`
