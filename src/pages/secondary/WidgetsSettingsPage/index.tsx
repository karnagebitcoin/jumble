import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { AVAILABLE_WIDGETS, useWidgets } from '@/providers/WidgetsProvider'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

const WidgetsSettingsPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { isWidgetEnabled, toggleWidget } = useWidgets()

  return (
    <SecondaryPageLayout ref={ref} index={index} title={t('Widgets')}>
      <div className="px-4 py-2 text-sm text-muted-foreground">
        {t('Customize which widgets appear in your sidebar')}
      </div>
      <div className="space-y-1">
        {AVAILABLE_WIDGETS.map((widget) => {
          const enabled = isWidgetEnabled(widget.id)
          return (
            <div
              key={widget.id}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors',
                enabled && 'bg-accent/30'
              )}
              onClick={() => toggleWidget(widget.id)}
            >
              <div className="flex-1 pr-4">
                <div className="font-medium">{t(widget.name)}</div>
                <div className="text-sm text-muted-foreground">{t(widget.description)}</div>
              </div>
              <Switch checked={enabled} onCheckedChange={() => toggleWidget(widget.id)} />
            </div>
          )
        })}
      </div>
    </SecondaryPageLayout>
  )
})
WidgetsSettingsPage.displayName = 'WidgetsSettingsPage'
export default WidgetsSettingsPage
