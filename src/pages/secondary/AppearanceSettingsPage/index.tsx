import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  BUTTON_RADIUS_VALUES,
  FONT_SIZES,
  LAYOUT_MODE,
  NOTIFICATION_LIST_STYLE,
  PRIMARY_COLORS
} from '@/constants'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { cn } from '@/lib/utils'
import { useButtonRadius } from '@/providers/ButtonRadiusProvider'
import { useCompactSidebar } from '@/providers/CompactSidebarProvider'
import { useFontSize } from '@/providers/FontSizeProvider'
import { useLayoutMode } from '@/providers/LayoutModeProvider'
import { usePageTheme } from '@/providers/PageThemeProvider'
import { usePrimaryColor } from '@/providers/PrimaryColorProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { useUserPreferences } from '@/providers/UserPreferencesProvider'
import { TPrimaryColor } from '@/types'
import { SelectValue } from '@radix-ui/react-select'
import { Check, Moon, Sun, Monitor } from 'lucide-react'
import { forwardRef, HTMLProps } from 'react'
import { useTranslation } from 'react-i18next'

const AppearanceSettingsPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { themeSetting, setThemeSetting } = useTheme()
  const { pageTheme, setPageTheme } = usePageTheme()
  const { fontSize, setFontSize } = useFontSize()
  const { primaryColor, setPrimaryColor } = usePrimaryColor()
  const { layoutMode, setLayoutMode } = useLayoutMode()
  const { notificationListStyle, updateNotificationListStyle } = useUserPreferences()
  const { buttonRadius, setButtonRadius } = useButtonRadius()
  const { compactSidebar, setCompactSidebar } = useCompactSidebar()

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />
      case 'dark':
        return <Moon className="w-5 h-5" />
      case 'pure-black':
        return <Moon className="w-5 h-5 fill-current" />
      case 'system':
        return <Monitor className="w-5 h-5" />
      default:
        return null
    }
  }

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case 'pure-black':
        return 'Pure Black'
      default:
        return t(theme)
    }
  }

  return (
    <SecondaryPageLayout ref={ref} index={index} title={t('Appearance')}>
      <div className="space-y-4 mt-3">
        <SettingItem className="flex-col items-start gap-3">
          <Label className="text-base font-normal">
            {t('Theme')}
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {(['system', 'light', 'dark', 'pure-black'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => {
                  if (theme === 'pure-black') {
                    setThemeSetting('dark')
                    setPageTheme('pure-black')
                  } else {
                    setThemeSetting(theme)
                    setPageTheme('default')
                  }
                }}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105',
                  (theme === 'pure-black' && pageTheme === 'pure-black') ||
                  (theme !== 'pure-black' && themeSetting === theme && pageTheme === 'default')
                    ? 'border-primary'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <div className="flex items-center justify-center w-8 h-8">
                  {getThemeIcon(theme)}
                </div>
                <span className="text-xs font-medium capitalize">{getThemeLabel(theme)}</span>
                {((theme === 'pure-black' && pageTheme === 'pure-black') ||
                  (theme !== 'pure-black' && themeSetting === theme && pageTheme === 'default')) && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
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
        <SettingItem className="flex-col items-start gap-3">
          <div className="w-full">
            <Label className="text-base font-normal">{t('Button radius')}</Label>
            <div className="text-sm text-muted-foreground">
              {buttonRadius === 9999
                ? t('Fully rounded')
                : buttonRadius === 0
                  ? t('Square corners')
                  : `${buttonRadius}px`}
            </div>
          </div>
          <div className="w-full px-2">
            <Slider
              min={0}
              max={BUTTON_RADIUS_VALUES.length - 1}
              step={1}
              value={[BUTTON_RADIUS_VALUES.indexOf(buttonRadius as any)]}
              onValueChange={(value) => {
                setButtonRadius(BUTTON_RADIUS_VALUES[value[0]])
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{t('Square')}</span>
              <span>{t('Round')}</span>
            </div>
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
          <Label htmlFor="compact-sidebar" className="text-base font-normal">
            <div>{t('Compact sidebar')}</div>
            <div className="text-muted-foreground">
              {t('Show only icons in the sidebar')}
            </div>
          </Label>
          <Switch
            id="compact-sidebar"
            checked={compactSidebar}
            onCheckedChange={setCompactSidebar}
          />
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
