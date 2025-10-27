import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import storage from '@/services/local-storage.service'
import { useNostr } from '@/providers/NostrProvider'
import { useTranslationService } from '@/providers/TranslationServiceProvider'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const DEFAULT_MODEL = 'google/gemini-2.0-flash-001'

export default function OpenRouter() {
  const { t } = useTranslation()
  const { config, updateConfig } = useTranslationService()
  const { pubkey } = useNostr()
  const [apiKey, setApiKey] = useState(
    config.service === 'openrouter' ? (config.api_key ?? '') : ''
  )
  const [model, setModel] = useState(
    config.service === 'openrouter' ? (config.model ?? '') : ''
  )
  const initialized = useRef(false)

  // Get AI config from storage
  const aiServiceConfig = storage.getAIServiceConfig(pubkey)

  // Pre-populate from AI tools if available
  useEffect(() => {
    if (config.service === 'openrouter' && !apiKey && aiServiceConfig.apiKey) {
      setApiKey(aiServiceConfig.apiKey)
    }
    if (config.service === 'openrouter' && !model) {
      if (aiServiceConfig.model) {
        setModel(aiServiceConfig.model)
      } else {
        setModel(DEFAULT_MODEL)
      }
    }
  }, [])

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      return
    }

    updateConfig({
      service: 'openrouter',
      api_key: apiKey,
      model: model
    })
  }, [apiKey, model])

  const hasAIConfig = !!(aiServiceConfig.apiKey && aiServiceConfig.model)

  const usingAIKey = !apiKey && hasAIConfig
  const usingAIModel = !model && aiServiceConfig.model
  const usingDefaultModel = !model && !aiServiceConfig.model

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="openrouter-api-key" className="text-base">
          API Key {usingAIKey && <span className="text-muted-foreground text-sm">(Using AI Tools key)</span>}
        </Label>
        <Input
          id="openrouter-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={usingAIKey ? 'Using AI Tools API key' : 'Enter OpenRouter API Key'}
        />
        {!apiKey && !hasAIConfig && (
          <p className="text-sm text-muted-foreground">
            You can configure an API key in AI Tools settings or enter one here
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="openrouter-model" className="text-base">
          Model {usingAIModel && <span className="text-muted-foreground text-sm">(Using AI Tools model)</span>}
          {usingDefaultModel && <span className="text-muted-foreground text-sm">(Default: {DEFAULT_MODEL})</span>}
        </Label>
        <Input
          id="openrouter-model"
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={
            usingAIModel
              ? `Using AI Tools model: ${aiServiceConfig.model}`
              : usingDefaultModel
              ? `Default: ${DEFAULT_MODEL}`
              : 'e.g., anthropic/claude-3.5-sonnet'
          }
        />
        {!hasAIConfig && (
          <p className="text-sm text-muted-foreground">
            Default model is {DEFAULT_MODEL}. You can change it here or configure in AI Tools settings.
          </p>
        )}
      </div>
    </div>
  )
}
