# AI Command Feature

This feature adds an `/ai` command to the note composer that allows users to leverage AI to generate content for their posts.

## Usage

1. **In the note composer, type `/ai` followed by your prompt**
   - Example: `/ai find me the link to madonna die another day`
   - Example: `/ai write a joke about bitcoin`
   - Example: `/ai translate "hello world" to japanese`

2. **Wait for the AI to process your request**
   - A preview card will appear showing the AI's response
   - The AI will think for a moment before showing the result

3. **Review and insert**
   - Click the "Insert" button to add the AI's response to your note
   - Or press `Enter` to quickly insert it
   - You can also click "Copy" to copy the result to your clipboard

## Requirements

- AI must be configured in the settings (Settings → AI Configuration)
- You need an API key from OpenRouter
- A model must be selected

## Features

- **Debounced requests**: The AI waits 500ms after you stop typing before making a request
- **Preview before insert**: You can see what the AI generated before adding it to your note
- **Flexible prompts**: Ask for anything - links, jokes, translations, facts, etc.
- **Keyboard shortcuts**: Press Enter to insert, Escape to close

## Examples

### Finding Links
```
/ai find me the link to madonna die another day
```
The AI will search and provide a YouTube link (or other relevant link).

### Generating Content
```
/ai write a joke about bitcoin
```
The AI will generate a joke that you can insert into your note.

### Translations
```
/ai translate "good morning" to spanish
```
The AI will provide the translation.

### Facts and Information
```
/ai what is the current bitcoin block height
```
The AI will provide current information (note: accuracy depends on the AI model's knowledge cutoff).

## Implementation Details

The feature is implemented as a TipTap extension similar to the existing `/gif` command:

- **Extension**: `src/components/PostEditor/PostTextarea/AICommand/index.ts`
- **List Component**: `src/components/PostEditor/PostTextarea/AICommand/AICommandList.tsx`
- **Suggestion Handler**: `src/components/PostEditor/PostTextarea/AICommand/suggestion.ts`

It integrates with the existing AI service that's already used for article summaries and other AI features in Jumble.
