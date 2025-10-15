import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { FONT_SIZES, LAYOUT_MODE, NOTIFICATION_LIST_STYLE, PRIMARY_COLORS } from '@/constants'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { cn } from '@/lib/utils'
import { useFontSize } from '@/providers/FontSizeProvider'
import { useLayoutMode } from '@/providers/LayoutModeProvider'
import { usePrimaryColor } from '@/providers/PrimaryColorProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { useUserPreferences } from '@/providers/UserPreferencesProvider'
import { TPrimaryColor } from '@/types'
import { SelectValue } from '@radix-ui/react-select'
import { Check } from 'lucide-react'
import { forwardRef, HTMLProps } from 'react'
import { useTranslation } from 'react-i18next'

const AppearanceSettingsPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { themeSetting, setThemeSetting } = useTheme()
  const { fontSize, setFontSize } = useFontSize()
  const { primaryColor, setPrimaryColor } = usePrimaryColor()
  const { layoutMode, setLayoutMode } = useLayoutMode()
  const { notificationListStyle, updateNotificationListStyle } = useUserPreferences()

  return (
    <SecondaryPageLayout ref={ref} index={index} title={t('Appearance')}>
      <div className="space-y-4 mt-3">
        <SettingItem>
          <Label htmlFor="theme" className="text-base font-normal">
            {t('Theme')}
          </Label>
          <Select defaultValue="system" value={themeSetting} onValueChange={setThemeSetting}>
            <SelectTrigger id="theme" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">{t('System')}</SelectItem>
              <SelectItem value="light">{t('Light')}</SelectItem>
              <SelectItem value="dark">{t('Dark')}</SelectItem>
            </SelectContent>
          </Select>
        </SettingItem>
        <SettingItem className="flex-col items-start gap-3">
          <Label className="text-base font-normal">
            {t('Primary color')}
          </Label>
          <div className="grid grid-cols-4 gap-3 w-full">
            {Object.entries(PRIMARY_COLORS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setPrimaryColor(key as TPrimaryColor)}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105',
                  primaryColor === key
                    ? 'border-primary'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <div
                  className="w-8 h-8 rounded-full shadow-md"
                  style={{
                    backgroundColor: `hsl(${config.light})`
                  }}
                />
                <span className="text-xs font-medium">{config.name}</span>
                {primaryColor === key && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </SettingItem>
        <SettingItem>
          <Label htmlFor="font-size" className="text-base font-normal">
            {t('Font size')}
          </Label>
          <Select
            value={fontSize.toString()}
            onValueChange={(value) => setFontSize(parseInt(value))}
          >
            <SelectTrigger id="font-size" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingItem>
        <SettingItem>
          <Label htmlFor="layout-mode" className="text-base font-normal">
            <div>{t('Layout mode')}</div>
            <div className="text-muted-foreground">
              {layoutMode === LAYOUT_MODE.BOXED
                ? t('Content is centered with max width')
                : t('Content spans full screen width')}
            </div>
          </Label>
          <Select
            defaultValue={LAYOUT_MODE.BOXED}
            value={layoutMode}
            onValueChange={setLayoutMode}
          >
            <SelectTrigger id="layout-mode" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={LAYOUT_MODE.BOXED}>{t('Boxed')}</SelectItem>
              <SelectItem value={LAYOUT_MODE.FULL_WIDTH}>{t('Full width')}</SelectItem>
            </SelectContent>
          </Select>
        </SettingItem>
        <SettingItem>
          <Label htmlFor="notification-list-style" className="text-base font-normal">
            <div>{t('Notification list style')}</div>
            <div className="text-muted-foreground">
              {notificationListStyle === NOTIFICATION_LIST_STYLE.DETAILED
                ? t('See extra info for each notification')
                : t('See more notifications at a glance')}
            </div>
          </Label>
          <Select
            defaultValue={NOTIFICATION_LIST_STYLE.DETAILED}
            value={notificationListStyle}
            onValueChange={updateNotificationListStyle}
          >
            <SelectTrigger id="notification-list-style" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NOTIFICATION_LIST_STYLE.DETAILED}>{t('Detailed')}</SelectItem>
              <SelectItem value={NOTIFICATION_LIST_STYLE.COMPACT}>{t('Compact')}</SelectItem>
            </SelectContent>
          </Select>
        </SettingItem>
      </div>
    </SecondaryPageLayout>
  )
})
AppearanceSettingsPage.displayName = 'AppearanceSettingsPage'
export default AppearanceSettingsPage

const SettingItem = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex justify-between select-none items-center px-4 min-h-9 [&_svg]:size-4 [&_svg]:shrink-0',
          className
        )}
        {...props}
        ref={ref}
      >
        {children}
      </div>
    )
  }
)
SettingItem.displayName = 'SettingItem'
