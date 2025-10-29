# Auto-Translate Feature

## Overview

The auto-translate feature automatically translates notes in foreign languages to English when enabled. Users can toggle between the translated and original versions seamlessly.

## Features

### 1. Auto-Translate Toggle
- Available in Translation Settings for all translation services:
  - **Jumble Translate**
  - **LibreTranslate**
  - **OpenRouter**
- When enabled, automatically translates notes in foreign languages to the app's specified language (English)
- Translation happens silently in the background

### 2. Translation Indicator
When a note has been translated, a small text appears above the content:
```
Translated from {language}. Show original
```
- Shows the detected source language (e.g., "Spanish", "Japanese", "French")
- "Show original" is a clickable link that switches to the original untranslated content

### 3. Original Content Toggle
When viewing the original content, the indicator changes to:
```
Viewing original. Show translated
```
- "Show translated" is a clickable link that switches back to the translated version
- Translation is retrieved from cache, no re-translation needed

## How It Works

### Auto-Translation Flow
1. User enables "Auto-translate notes" in Translation Settings
2. When a note is displayed:
   - The app detects the language of the note content
   - If the language differs from the app's language (English), translation is triggered automatically
   - Translation happens in the background without blocking the UI
   - Once complete, the translated content is displayed

### Manual Toggle Flow
1. User sees a translated note with "Translated from {language}. Show original"
2. Clicking "Show original":
   - Hides the translated version
   - Shows the original content
   - Updates indicator to "Viewing original. Show translated"
3. Clicking "Show translated":
   - Restores the translated version from cache
   - Updates indicator back to "Translated from {language}. Show original"

## Technical Implementation

### Configuration
Added `auto_translate` boolean field to `TTranslationServiceConfig`:
```typescript
export type TTranslationServiceConfig =
  | {
      service: 'jumble'
      auto_translate?: boolean
    }
  | {
      service: 'libre_translate'
      server?: string
      api_key?: string
      auto_translate?: boolean
    }
  | {
      service: 'openrouter'
      api_key?: string
      model?: string
      auto_translate?: boolean
    }
```

### New Components

#### TranslationIndicator
- Shows "Translated from {language}. Show original" when content is translated
- Detects source language from original content
- Provides toggle to show original content

#### ShowTranslatedButton
- Shows "Viewing original. Show translated" when viewing original content
- Provides toggle to show translated content
- Only visible if translation exists in cache

### Provider Methods

#### autoTranslateEvent(event: Event)
- Automatically translates an event if auto-translate is enabled
- Checks if translation is needed based on language detection
- Silently fails if translation service unavailable
- Uses existing translation cache

#### shouldAutoTranslate(): boolean
- Returns whether auto-translate is currently enabled
- Checks the active translation service configuration

### Language Detection
- Uses existing `detectLanguage()` utility to identify source language
- Supports 40+ languages with full names
- Falls back to language code if name not found
- Handles undefined/unknown languages gracefully

### Supported Note Types
Auto-translation works with the following note kinds:
- Short text notes (kind 1)
- Highlights (kind 9802)
- Comments (kind 1111)
- Picture notes (kind 20)
- Polls (kind 1068)
- Relay reviews (kind 1985)

## User Experience

### Settings Location
1. Navigate to Settings
2. Select "Translation" from the menu
3. Choose your translation service (Jumble, LibreTranslate, or OpenRouter)
4. Toggle "Auto-translate notes" switch
5. Description: "Automatically translate notes in foreign languages to English"

### In-Feed Experience
- Notes in foreign languages automatically show translated content
- Small, unobtrusive indicator above content
- Single click to toggle between translated and original
- No page reload or API calls when toggling (uses cache)
- Seamless experience across all note types

## Performance Considerations

- **Caching**: Translations are cached to avoid redundant API calls
- **Background Processing**: Auto-translation doesn't block UI rendering
- **Silent Failures**: Auto-translation failures don't show error messages (logged to console)
- **Language Detection**: Happens instantly using built-in detection algorithm
- **Selective Translation**: Only translates when source language differs from target

## Settings UI

### OpenRouter Settings
```
API Key: [Input field with password type]
Model: [Input field with model name]
Auto-translate notes: [Toggle switch]
  "Automatically translate notes in foreign languages to English"
```

### LibreTranslate Settings
```
Service address: [Input field]
API key: [Input field]
Auto-translate notes: [Toggle switch]
  "Automatically translate notes in foreign languages to English"
```

### Jumble Translate Settings
```
Balance: [Display balance]
API key: [Masked input with show/hide toggle]
[Top up section]
Auto-translate notes: [Toggle switch]
  "Automatically translate notes in foreign languages to English"
```

## Future Enhancements

Potential improvements for future versions:
- Allow users to select target language (currently defaults to app language)
- Add language preferences (e.g., never translate certain languages)
- Translation quality indicator
- Batch translation for better performance
- Translation history/statistics
- Per-user auto-translate preferences
