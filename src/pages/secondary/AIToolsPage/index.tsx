import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useAI } from '@/providers/AIProvider'
import aiService from '@/services/ai.service'
import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const AIToolsPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { serviceConfig, toolsConfig, updateServiceConfig, updateToolsConfig } = useAI()
  const [apiKey, setApiKey] = useState(serviceConfig.apiKey || '')
  const [selectedModel, setSelectedModel] = useState(serviceConfig.model || '')
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    setApiKey(serviceConfig.apiKey || '')
    setSelectedModel(serviceConfig.model || '')
  }, [serviceConfig])

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error(t('Please enter an API key'))
      return
    }

    // Test the API key
    const tempConfig = { ...serviceConfig, apiKey: apiKey.trim() }
    aiService.setConfig(tempConfig)
    const isValid = await aiService.testConnection()

    if (!isValid) {
      toast.error(t('Invalid API key or connection failed'))
      return
    }

    updateServiceConfig(tempConfig)
    toast.success(t('API key saved successfully'))

    // Load available models
    loadModels()
  }

  const loadModels = async () => {
    setIsLoadingModels(true)
    try {
      const models = await aiService.getAvailableModels()
      setAvailableModels(models)
    } catch (error) {
      console.error('Failed to load models:', error)
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId)
    updateServiceConfig({ ...serviceConfig, model: modelId })
    toast.success(t('Model selected successfully'))
  }

  const handleToggleSummary = (enabled: boolean) => {
    updateToolsConfig({ ...toolsConfig, enableSummary: enabled })
  }

  useEffect(() => {
    if (serviceConfig.apiKey) {
      loadModels()
    }
  }, [serviceConfig.apiKey])

  return (
    <SecondaryPageLayout ref={ref} index={index} title={t('AI Tools')}>
      <div className="px-4 pt-3 space-y-6">
        {/* OpenRouter Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t('OpenRouter')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('Configure OpenRouter API to enable AI features')}
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key">{t('API Key')}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder={t('Enter your OpenRouter API key')}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button onClick={handleSaveApiKey}>{t('Save')}</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('Get your API key from')}{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          {/* Model Selection */}
          {serviceConfig.apiKey && (
            <div className="space-y-2">
              <Label htmlFor="model-select">{t('Default Model')}</Label>
              <Select
                value={selectedModel}
                onValueChange={handleModelSelect}
                disabled={isLoadingModels || availableModels.length === 0}
              >
                <SelectTrigger id="model-select">
                  <SelectValue
                    placeholder={
                      isLoadingModels
                        ? t('Loading models...')
                        : availableModels.length === 0
                          ? t('No models available')
                          : t('Select a model')
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableModels.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('Select the AI model to use for all AI features')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* AI Features */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t('AI Features')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('Enable or disable specific AI-powered features')}
            </p>
          </div>

          {/* Article Summary Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="enable-summary" className="text-base font-medium cursor-pointer">
                {t('Article Summaries')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('Show summarize button on article previews')}
              </p>
            </div>
            <Switch
              id="enable-summary"
              checked={toolsConfig.enableSummary}
              onCheckedChange={handleToggleSummary}
              disabled={!serviceConfig.apiKey || !serviceConfig.model}
            />
          </div>

          {!serviceConfig.apiKey && (
            <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              ⚠️ {t('Please configure your OpenRouter API key to enable AI features')}
            </p>
          )}
        </div>
      </div>
    </SecondaryPageLayout>
  )
})
AIToolsPage.displayName = 'AIToolsPage'
export default AIToolsPage
