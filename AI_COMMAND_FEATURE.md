# AI Command Feature

This feature adds an `/ai` command to the note composer that allows users to leverage AI to generate content for their posts.

## Usage

1. **In the note composer, type `/ai`**
   - A dropdown panel will appear with a focused input field

2. **Enter your prompt in the input field**
   - Example: `find me the link to madonna die another day`
   - Example: `write a joke about bitcoin`
   - Example: `translate "hello world" to japanese`

3. **Submit your prompt**
   - Click the arrow button (→) to submit
   - Or press `Enter` to submit

4. **Wait for the AI to process your request**
   - The AI will think for a moment before showing the result
   - A preview of the response will appear below the input

5. **Review and insert**
   - Click the "Insert" button to add the AI's response to your note
   - Or press `Enter` to quickly insert it
   - You can also click "Copy" to copy the result to your clipboard

## Requirements

- AI must be configured in the settings (Settings → AI Configuration)
- You need an API key from OpenRouter
- A model must be selected

## Features

- **Dedicated input field**: Type your prompt in a separate input to avoid accidentally posting it
- **Auto-focus**: The input field is automatically focused when you type `/ai`
- **Preview before insert**: You can see what the AI generated before adding it to your note
- **Flexible prompts**: Ask for anything - links, jokes, translations, facts, etc.
- **Keyboard shortcuts**: Press Enter to submit/insert, Escape to close
- **Safe workflow**: Your prompt is never added to the note itself, preventing accidental posts

## Examples

### Finding Links
1. Type `/ai` in the note composer
2. In the input field that appears, type: `find me the link to madonna die another day`
3. Click the arrow or press Enter
4. Review the YouTube link the AI provides
5. Click "Insert" to add it to your note

### Generating Content
1. Type `/ai` in the note composer
2. In the input field, type: `write a joke about bitcoin`
3. Submit and wait for the AI
4. Review the joke
5. Click "Insert" to add it to your note

### Translations
1. Type `/ai` in the note composer
2. In the input field, type: `translate "good morning" to spanish`
3. Submit and get the translation
4. Insert it into your note

### Facts and Information
1. Type `/ai` in the note composer
2. In the input field, type: `what is the current bitcoin block height`
3. Get the AI's response (note: accuracy depends on the AI model's knowledge cutoff)
4. Insert if desired

## Implementation Details

The feature is implemented as a TipTap extension similar to the existing `/gif` command:

- **Extension**: `src/components/PostEditor/PostTextarea/AICommand/index.ts`
- **List Component**: `src/components/PostEditor/PostTextarea/AICommand/AICommandList.tsx`
- **Suggestion Handler**: `src/components/PostEditor/PostTextarea/AICommand/suggestion.ts`

It integrates with the existing AI service that's already used for article summaries and other AI features in Jumble.
