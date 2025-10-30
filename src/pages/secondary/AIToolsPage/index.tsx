import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { TAIProvider } from '@/types'
import aiService from '@/services/ai.service'
import { Check, Eye, EyeOff } from 'lucide-react'
import { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const AIToolsPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { serviceConfig, toolsConfig, updateServiceConfig, updateToolsConfig, getAvailableImageModels } = useAI()
  const [selectedProvider, setSelectedProvider] = useState<TAIProvider>(serviceConfig.provider || 'openrouter')
  const [apiKey, setApiKey] = useState(serviceConfig.apiKey || '')
  const [selectedModel, setSelectedModel] = useState(serviceConfig.model || '')
  const [selectedImageModel, setSelectedImageModel] = useState(serviceConfig.imageModel || 'openai/gpt-5-image-mini')
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>([])
  const [availableImageModels, setAvailableImageModels] = useState<Array<{ id: string; name: string }>>([])
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    setSelectedProvider(serviceConfig.provider || 'openrouter')
    setApiKey(serviceConfig.apiKey || '')
    setSelectedModel(serviceConfig.model || '')
    setSelectedImageModel(serviceConfig.imageModel || 'openai/gpt-5-image-mini')
    // Load the handpicked models
    loadModels()
    loadImageModels()
  }, [serviceConfig])

  const handleProviderSelect = (provider: TAIProvider) => {
    setSelectedProvider(provider)
    // Reset config when switching providers
    const newConfig = {
      provider,
      apiKey: '',
      model: '',
      imageModel: ''
    }
    setApiKey('')
    setSelectedModel('')
    setSelectedImageModel('')
    updateServiceConfig(newConfig)
    loadModels()
    loadImageModels()
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error(t('Please enter an API key'))
      return
    }

    // Test the API key
    const tempConfig = { ...serviceConfig, provider: selectedProvider, apiKey: apiKey.trim() }
    aiService.setConfig(tempConfig)
    const isValid = await aiService.testConnection()

    if (!isValid) {
      toast.error(t('Invalid API key or connection failed'))
      return
    }

    updateServiceConfig(tempConfig)
    toast.success(t('API key saved successfully'))
  }

  const loadModels = async () => {
    try {
      const models = await aiService.getAvailableModels()
      setAvailableModels(models)
    } catch (error) {
      console.error('Failed to load models:', error)
    }
  }

  const loadImageModels = async () => {
    try {
      const models = await getAvailableImageModels()
      setAvailableImageModels(models)
    } catch (error) {
      console.error('Failed to load image models:', error)
    }
  }

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId)
    updateServiceConfig({ ...serviceConfig, provider: selectedProvider, model: modelId })
    toast.success(t('Default model selected successfully'))
  }

  const handleImageModelSelect = (modelId: string) => {
    setSelectedImageModel(modelId)
    updateServiceConfig({ ...serviceConfig, provider: selectedProvider, imageModel: modelId })
    toast.success(t('Image model selected successfully'))
  }

  const handleToggleSummary = (enabled: boolean) => {
    updateToolsConfig({ ...toolsConfig, enableSummary: enabled })
  }

  const getProviderInfo = (provider: TAIProvider) => {
    switch (provider) {
      case 'openrouter':
        return {
          name: 'OpenRouter',
          description: 'Access to multiple AI models through a unified API',
          apiKeyUrl: 'https://openrouter.ai/keys'
        }
      case 'ppq':
        return {
          name: 'PPQ.ai',
          description: 'Pay with bitcoin and lightning',
          apiKeyUrl: 'https://ppq.ai'
        }
      default:
        return {
          name: 'Unknown',
          description: '',
          apiKeyUrl: ''
        }
    }
  }

  const providerInfo = getProviderInfo(selectedProvider)

  return (
    <SecondaryPageLayout ref={ref} index={index} title={t('AI Tools')}>
      <div className="px-4 pt-3 space-y-6">
        {/* Provider Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t('AI Provider')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('Select your AI service provider')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OpenRouter Card */}
            <Card
              className={cn(
                'cursor-pointer transition-all hover:border-primary/50',
                selectedProvider === 'openrouter' && 'border-primary ring-2 ring-primary/20'
              )}
              onClick={() => handleProviderSelect('openrouter')}
            >
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">OpenRouter</CardTitle>
                  {selectedProvider === 'openrouter' && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardDescription className="text-xs">
                  Access to multiple AI models through a unified API
                </CardDescription>
              </CardHeader>
            </Card>

            {/* PPQ.ai Card */}
            <Card
              className={cn(
                'cursor-pointer transition-all hover:border-primary/50',
                selectedProvider === 'ppq' && 'border-primary ring-2 ring-primary/20'
              )}
              onClick={() => handleProviderSelect('ppq')}
            >
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">PPQ.ai</CardTitle>
                  {selectedProvider === 'ppq' && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardDescription className="text-xs">
                  Pay with bitcoin and lightning
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Provider Configuration */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{providerInfo.name} {t('Configuration')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('Configure your API credentials and preferences')}
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
                  placeholder={t('Enter your API key')}
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
            {providerInfo.apiKeyUrl && (
              <p className="text-xs text-muted-foreground">
                {t('Get your API key from')}{' '}
                <a
                  href={providerInfo.apiKeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {providerInfo.apiKeyUrl.replace('https://', '')}
                </a>
              </p>
            )}
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model-select">{t('Default Model')}</Label>
            <Select
              value={selectedModel}
              onValueChange={handleModelSelect}
              disabled={availableModels.length === 0}
            >
              <SelectTrigger id="model-select">
                <SelectValue
                  placeholder={
                    availableModels.length === 0
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
                {t('Model for text generation, summaries, and general AI tasks')}
              </p>
            )}
          </div>

          {/* Image Model Selection - Only for OpenRouter */}
          {selectedProvider === 'openrouter' && (
            <div className="space-y-2">
              <Label htmlFor="image-model-select">{t('Image Generation Model')}</Label>
              <Select
                value={selectedImageModel}
                onValueChange={handleImageModelSelect}
                disabled={availableImageModels.length === 0}
              >
                <SelectTrigger id="image-model-select">
                  <SelectValue
                    placeholder={
                      availableImageModels.length === 0
                        ? t('No image models available')
                        : t('Select an image model')
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableImageModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableImageModels.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('Model used when you request images via /ai command')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* AI Features Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('Article Summaries')}</CardTitle>
              <Switch
                checked={toolsConfig.enableSummary}
                onCheckedChange={handleToggleSummary}
                disabled={!serviceConfig.apiKey || !serviceConfig.model}
              />
            </div>
            <CardDescription>
              {t('Show summarize button on article previews')}
            </CardDescription>
          </CardHeader>
          {(!serviceConfig.apiKey || !serviceConfig.model) && (
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                ⚠️ {t('Please configure your API key and select a model to enable AI features')}
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </SecondaryPageLayout>
  )
})
AIToolsPage.displayName = 'AIToolsPage'
export default AIToolsPage
