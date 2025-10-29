# Image Command Feature

The `/image` command in the note composer allows you to generate AI images directly within your notes using the configured image model from AI settings.

## How to Use

### 1. Configure Image Model

Before using the `/image` command, you need to configure an image model in AI settings:

1. Go to Settings → AI Settings
2. Select an image model from the dropdown (e.g., "OpenAI GPT-5 Image Mini")
3. Make sure you have an API key configured

### 2. Generate an Image

In the note composer, type `/image` followed by your prompt:

```
/image orange beetle
```

This will:
1. Show a submit button or press Enter to generate
2. Display a loading indicator while generating
3. Show a preview of the generated image
4. Allow you to insert the image URL or copy it

### 3. Insert the Image

Once the image is generated:
- Click "Insert Image" button, or
- Press Enter to insert the image URL into your note
- The URL will be automatically rendered as an image in Nostr clients

## Examples

```
/image a beautiful sunset over mountains
/image cyberpunk city at night with neon lights
/image cute orange beetle in a forest
/image abstract art with vibrant colors
```

## Features

- **Preview**: See the generated image before inserting
- **Copy URL**: Copy the image URL to clipboard
- **Keyboard shortcuts**: Press Enter to submit or insert
- **Error handling**: Clear error messages if generation fails
- **Model selection**: Uses the image model configured in AI settings

## Commands Comparison

- `/ai` - For text responses and web queries (uses text model)
- `/image` - For image generation (uses image model)
- `/gif` - For inserting GIFs from Giphy/Tenor
- `@` - For mentioning users
- `:` - For emoji picker

## Requirements

- AI settings must be configured with:
  - Valid API key
  - Selected image model
- Internet connection for API requests

## Notes

- Image generation may take a few seconds depending on the model
- Generated images are hosted by the AI provider
- Image URLs can be used in any Nostr client that supports image rendering
- The `/image` command is separate from `/ai` to give you precise control over which model to use
