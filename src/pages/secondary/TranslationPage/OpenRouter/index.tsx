import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useAI } from '@/providers/AIProvider'
import { useTranslationService } from '@/providers/TranslationServiceProvider'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function OpenRouter() {
  const { t } = useTranslation()
  const { config, updateConfig } = useTranslationService()
  const { serviceConfig: aiServiceConfig } = useAI()
  const [apiKey, setApiKey] = useState(
    config.service === 'openrouter' ? (config.api_key ?? '') : ''
  )
  const [model, setModel] = useState(
    config.service === 'openrouter' ? (config.model ?? '') : ''
  )
  const initialized = useRef(false)

  // Pre-populate from AI tools if available
  useEffect(() => {
    if (config.service === 'openrouter' && !apiKey && aiServiceConfig.apiKey) {
      setApiKey(aiServiceConfig.apiKey)
    }
    if (config.service === 'openrouter' && !model && aiServiceConfig.model) {
      setModel(aiServiceConfig.model)
    }
  }, [aiServiceConfig])

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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="openrouter-api-key" className="text-base">
          API Key {hasAIConfig && !apiKey && <span className="text-muted-foreground text-sm">(Using AI Tools key)</span>}
        </Label>
        <Input
          id="openrouter-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={hasAIConfig && !apiKey ? 'Using AI Tools API key' : 'Enter OpenRouter API Key'}
        />
        {!apiKey && !hasAIConfig && (
          <p className="text-sm text-muted-foreground">
            You can configure an API key in AI Tools settings or enter one here
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="openrouter-model" className="text-base">
          Model {hasAIConfig && !model && <span className="text-muted-foreground text-sm">(Using AI Tools model)</span>}
        </Label>
        <Input
          id="openrouter-model"
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={hasAIConfig && !model ? 'Using AI Tools model' : 'e.g., anthropic/claude-3.5-sonnet'}
        />
        {!model && !hasAIConfig && (
          <p className="text-sm text-muted-foreground">
            You can configure a model in AI Tools settings or enter one here
          </p>
        )}
      </div>
    </div>
  )
}
