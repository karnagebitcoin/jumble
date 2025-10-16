import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

const SidebarItem = forwardRef<
  HTMLButtonElement,
  ButtonProps & { title: string; description?: string; active?: boolean }
>(({ children, title, description, className, active, ...props }, ref) => {
  const { t } = useTranslation()

  return (
    <Button
      className={cn(
        'flex shadow-none items-center transition-colors duration-500 bg-transparent w-12 h-12 xl:w-full xl:h-auto p-3 m-0 xl:py-2 xl:px-3 rounded-lg xl:justify-start gap-4 font-medium [&_svg]:size-full xl:[&_svg]:size-4 [&_svg]:stroke-[1.3]',
        active && 'text-primary hover:text-primary bg-primary/10 hover:bg-primary/10',
        className
      )}
      style={{ fontSize: 'var(--font-size, 14px)' }}
      variant="ghost"
      title={t(title)}
      ref={ref}
      {...props}
    >
      {children}
      <div className="max-xl:hidden">{t(description ?? title)}</div>
    </Button>
  )
})
SidebarItem.displayName = 'SidebarItem'
export default SidebarItem
