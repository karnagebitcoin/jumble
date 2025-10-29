# Quick Image Generation Guide

## TL;DR

Type `/ai image of a monkey` in the note composer and press Enter. An image will be generated and previewed. Click "Insert Image" to add it to your note.

## Setup (One Time)

1. Go to **Settings → AI Tools**
2. Enter your **OpenRouter API Key**
3. Click **Save**
4. Models are pre-configured:
   - **Default Model**: `xAI Grok 4 Fast` (for text)
   - **Image Model**: `OpenAI GPT-5 Image Mini` (for images)

## Usage

### Generate an Image

```
/ai image of [what you want]
```

Examples:
- `/ai image of a monkey`
- `/ai create a picture of a sunset`
- `/ai generate a drawing of a cat`
- `/ai make an illustration of mountains`

### What Happens

1. Type `/ai image of a monkey` → Press Enter
2. See "Generating..." (uses `openai/gpt-5-image-mini`)
3. Image preview appears
4. Click "Insert Image" or press Enter again
5. Image URL added to your note

### Generate Text (Not Images)

```
/ai [any other request]
```

Examples:
- `/ai write a joke about bitcoin` → Uses default model (Grok 4 Fast)
- `/ai translate hello to spanish` → Uses default model
- `/ai find the link to bitcoin whitepaper` → Uses default model

## Model Selection

### When to Change Models

**Default Model** (for text):
- Choose based on: speed, cost, quality, reasoning ability
- Used for: Everything except images
- Good options: Grok 4 Fast (default), GPT-5 Mini, Gemini 2.5 Flash

**Image Model** (for images):
- Choose based on: image quality, speed, cost
- Used for: Only `/ai image...` requests
- Good options:
  - `openai/gpt-5-image-mini` (default) - Fast & affordable
  - `openai/gpt-5-image` - Higher quality
  - `google/gemini-2.5-flash-image` - Alternative

### How to Change

1. Go to **Settings → AI Tools**
2. Use dropdown to select different model
3. Changes save automatically

## Troubleshooting

### "AI is not configured"
→ Add your API key in Settings → AI Tools

### No image appears, just text
→ Check console (F12) for error logs
→ Verify your prompt includes "image" + "of/about/for"

### Different model than expected
→ Text requests use Default Model
→ Image requests use Image Generation Model
→ Check which you configured in settings

## Tips

✅ **Good Prompts**:
- "image of a [subject]"
- "create a picture of [scene]"
- "generate a [style] of [subject]"

❌ **Won't Trigger Image Mode**:
- "show me a monkey" (missing "image" keyword)
- "image" (missing subject)
- "create something cool" (too vague)

## Cost Optimization

Image generation costs more than text:
- Text: ~$0.0002 per 1M tokens (Grok 4 Fast)
- Images: ~$0.001238 per image (GPT-5 Image Mini)

Using separate models means:
- Cheap text queries stay cheap
- Only pay for images when you actually generate them
