# AI Image Generation Testing Guide

## How to Test the Feature

1. **Open the Note Composer**
   - Click to create a new note in Jumble

2. **Type the /ai Command**
   - Type `/ai` followed by your image request
   - Example: `/ai image of a monkey`

3. **Submit the Request**
   - Press Enter or click the arrow button
   - You should see "Generating..." appear

4. **Open Browser Console**
   - Press F12 to open developer tools
   - Go to the "Console" tab
   - Watch for debug output

## What to Look For in Console

When you submit an image generation request, you should see these logs:

```
Image generation response: {choices: [...], ...}
```

This shows the raw response from OpenRouter's API. Look inside for:

### Expected Response Format

The response should look something like:

```javascript
{
  choices: [{
    message: {
      content: [
        {
          type: "image_url",
          image_url: {
            url: "https://..."
          }
        }
      ]
      // OR
      content: "https://..."
      // OR
      content: [
        {
          type: "text",
          text: "Here's your image: https://..."
        }
      ]
    }
  }]
}
```

### What the Logs Tell You

1. **"Content is array:"** - The response is in multimodal format
2. **"Content is string:"** - The response is plain text (may contain URL)
3. **"Found image URL:"** - Successfully extracted image URL from structured format
4. **"Extracted URL from text:"** - Found URL embedded in text content
5. **"Extracted URL from string:"** - Found URL in plain string response

## Expected Behavior

### Success Case:
1. See "Generating..." while processing
2. Console shows image URL being extracted
3. Image preview appears in the UI
4. Can click "Insert Image" to add to note

### Debug Case (URL not auto-detected):
1. See "Generating..." while processing
2. Console shows response format
3. Debug UI shows raw response
4. Can still insert raw text manually

## Common Issues & Solutions

### Issue: "Here you go" without image

**Likely Cause**: The model returned text instead of an image URL

**Check**: Look in console for "Content is string:" and see what text was returned

**Solution**: The response parsing will extract any URL from the text. If no URL is found, you'll see a debug view.

### Issue: Image not displaying in preview

**Likely Cause**: URL was extracted but Image component failed to load it

**Check**: Look for "Found image URL:" in console to see the URL

**Solution**: Try clicking "Copy URL" and paste it in a browser to verify the URL is valid

### Issue: Wrong model being used

**Likely Cause**: Detection regex didn't match your prompt

**Check**: Make sure your prompt includes both:
- Action word: image, picture, photo, drawing, illustration, generate, create, make, draw, paint
- Context word: of, about, for, showing, depicting

**Example Good Prompts**:
- ✅ "image of a monkey"
- ✅ "create a picture of sunset"
- ✅ "generate a drawing of a cat"
- ✅ "make an illustration of mountains"

**Example Bad Prompts**:
- ❌ "give me a monkey" (missing "image" keyword)
- ❌ "image" (missing context/subject)
- ❌ "create something" (too vague)

## Verifying the Feature Works

To verify the feature is working:

1. Check the console logs appear when you submit
2. Verify the API call goes to `google/gemini-2.5-flash-image` model
3. Check that the response is being logged
4. Confirm URL extraction logs appear
5. Verify preview UI updates accordingly

## Next Steps

If you see the issue where "here you go" appears without an image:

1. Share the console logs (screenshot or copy)
2. Note what the `message.content` contains
3. This will help identify the exact response format from the model
4. We can then update the parsing logic to handle that specific format
