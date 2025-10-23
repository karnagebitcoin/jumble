import { TAIServiceConfig, TArticleSummary } from '@/types'

class AIService {
  private config: TAIServiceConfig = {
    provider: 'openrouter'
  }

  setConfig(config: TAIServiceConfig) {
    this.config = config
  }

  getConfig(): TAIServiceConfig {
    return this.config
  }

  async summarizeArticle(
    title: string,
    description: string,
    url: string
  ): Promise<TArticleSummary> {
    if (!this.config.apiKey) {
      throw new Error('API key not configured')
    }

    if (!this.config.model) {
      throw new Error('Model not selected')
    }

    const prompt = `Analyze this article and provide:
1. A list of 3-5 key takeaways (as bullet points)
2. A comprehensive summary in 1-2 paragraphs

Article Title: ${title}
${description ? `Description: ${description}` : ''}
URL: ${url}

Format your response as JSON with this exact structure:
{
  "keyTakeaways": ["takeaway1", "takeaway2", ...],
  "summary": "Your 1-2 paragraph summary here"
}`

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Jumble'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to generate summary')
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No response from AI')
      }

      // Try to parse JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format')
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        title,
        keyTakeaways: parsed.keyTakeaways || [],
        summary: parsed.summary || ''
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.config.apiKey) {
      return false
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }

  async getAvailableModels(): Promise<Array<{ id: string; name: string }>> {
    if (!this.config.apiKey) {
      return []
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`
        }
      })

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return (
        data.data?.map((model: any) => ({
          id: model.id,
          name: model.name || model.id
        })) || []
      )
    } catch {
      return []
    }
  }
}

const aiService = new AIService()
export default aiService
