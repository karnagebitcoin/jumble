# Image Generation Feature - Implementation Summary

## Overview

The `/ai` command now supports automatic image generation by detecting when users request images and switching to a dedicated image generation model.

## Architecture

### Two Separate Models

1. **Default Model** (`x-ai/grok-4-fast`)
   - Used for: Text generation, article summaries, general AI tasks
   - Configured in: Settings → AI Tools → Default Model
   - Example usage: `/ai write a joke about bitcoin`

2. **Image Generation Model** (`openai/gpt-5-image-mini`)
   - Used for: Image generation only
   - Configured in: Settings → AI Tools → Image Generation Model
   - Example usage: `/ai image of a monkey`
   - Alternative options available:
     - `openai/gpt-5-image` (higher quality, higher cost)
     - `google/gemini-2.5-flash-image` (alternative provider)

## How It Works

### 1. Request Detection

When you type `/ai image of a monkey`, the system:
- Detects keywords: "image" + "of"
- Sets `isGeneratingImage = true`
- Shows "Generating..." status

### 2. Model Selection

For image requests:
```typescript
// Automatically uses the configured image model
const imageUrl = await aiService.generateImage(userPrompt)
```

For text requests:
```typescript
// Uses your configured default model
const response = await chat([...messages])
```

### 3. API Request Format

Image generation uses the proper multimodal format:

```typescript
{
  model: "openai/gpt-5-image-mini",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "image of a monkey"
        }
      ]
    }
  ]
}
```

### 4. Response Parsing

The system handles multiple response formats:
- Structured `image_url.url` format
- Plain URL strings
- URLs embedded in text content
- Base64 data URLs

### 5. Display

Successfully extracted images are shown in a preview card with:
- Full image preview
- "Insert Image" button
- "Copy URL" button

If parsing fails, a debug view shows the raw response.

## User Experience Flow

1. User types: `/ai image of a monkey`
2. System shows: Submit button with prompt text
3. User presses Enter or clicks submit
4. System shows: "Generating..." (not "Thinking...")
5. API call made to: `openai/gpt-5-image-mini`
6. Response logged to console for debugging
7. Image URL extracted and displayed
8. User clicks "Insert Image" to add to note

## Settings UI

In Settings → AI Tools:

```
┌─────────────────────────────────────┐
│ OpenRouter                          │
│                                     │
│ API Key: [••••••••••] [👁] [Save]  │
│                                     │
│ Default Model:                      │
│ [xAI Grok 4 Fast           ▼]      │
│ Model for text generation...       │
│                                     │
│ Image Generation Model:             │
│ [OpenAI GPT-5 Image Mini   ▼]      │
│ Model used when you request...     │
└─────────────────────────────────────┘
```

## Configuration Storage

```typescript
type TAIServiceConfig = {
  provider: 'openrouter'
  apiKey?: string
  model?: string          // Default model (grok-4-fast)
  imageModel?: string     // Image model (gpt-5-image-mini)
}
```

Stored in local storage per user, persists across sessions.

## API Integration

### Service Layer (`ai.service.ts`)

- `chat()` - Uses default model for text
- `generateImage()` - Uses image model for images
- `getAvailableModels()` - Lists text models
- `getAvailableImageModels()` - Lists image models

### Provider Layer (`AIProvider.tsx`)

Exposes both methods to components:
- `chat()` - For text generation
- `generateImage()` - For image generation
- `getAvailableImageModels()` - For settings UI

## Detection Logic

Image requests must include:
- **Action word**: image, picture, photo, drawing, illustration, generate, create, make, draw, paint
- **Context word**: of, about, for, showing, depicting

Examples:
- ✅ `/ai image of a monkey`
- ✅ `/ai create a picture of sunset`
- ✅ `/ai generate an illustration of mountains`
- ❌ `/ai give me a monkey` (no "image" keyword)
- ❌ `/ai image` (no context)

## Debugging

All image generation attempts log to console:
- Request details
- Response format
- URL extraction attempts
- Final result

Check console (F12) to diagnose any issues.

## Benefits

1. **Clean Separation**: Text and image models don't interfere
2. **Optimized Costs**: Use fast/cheap text model, efficient image model
3. **User Control**: Choose best model for each use case
4. **Automatic Switching**: No manual commands needed
5. **Sensible Defaults**: Works out of the box
