import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { AVAILABLE_WIDGETS, useWidgets } from '@/providers/WidgetsProvider'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

const WidgetsSettingsPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { isWidgetEnabled, toggleWidget } = useWidgets()

  return (
    <SecondaryPageLayout ref={ref} index={index} title={t('Widgets')}>
      <div className="px-4 py-3 text-sm text-muted-foreground border-b">
        {t('Customize which widgets appear in your sidebar. Drag widgets to reorder them.')}
      </div>
      <div className="p-4 space-y-3">
        {AVAILABLE_WIDGETS.map((widget) => {
          const enabled = isWidgetEnabled(widget.id)
          return (
            <div
              key={widget.id}
              className={cn(
                'relative overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer group',
                enabled
                  ? 'border-primary bg-primary/5 shadow-sm hover:shadow-md'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-accent/30'
              )}
              onClick={() => toggleWidget(widget.id)}
            >
              <div className="flex items-start gap-4 p-4">
                {/* Icon */}
                <div
                  className={cn(
                    'flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center transition-colors',
                    enabled
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  )}
                >
                  {widget.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base">{t(widget.name)}</h3>
                    {enabled && (
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{t(widget.description)}</p>
                </div>

                {/* Switch */}
                <div className="flex-shrink-0">
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => toggleWidget(widget.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Active indicator bar */}
              {enabled && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              )}
            </div>
          )
        })}
      </div>
    </SecondaryPageLayout>
  )
})
WidgetsSettingsPage.displayName = 'WidgetsSettingsPage'
export default WidgetsSettingsPage
