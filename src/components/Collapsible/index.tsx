import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function Collapsible({
  alwaysExpand = false,
  children,
  className,
  threshold = 1000,
  collapsedHeight = 600,
  ...props
}: {
  alwaysExpand?: boolean
  threshold?: number
  collapsedHeight?: number
} & React.HTMLProps<HTMLDivElement>) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [shouldCollapse, setShouldCollapse] = useState(false)

  useEffect(() => {
    if (alwaysExpand || shouldCollapse) return

    const contentEl = containerRef.current
    if (!contentEl) return

    const checkHeight = () => {
      const fullHeight = contentEl.scrollHeight
      if (fullHeight > threshold) {
        setShouldCollapse(true)
      }
    }

    checkHeight()

    const observer = new ResizeObserver(() => {
      checkHeight()
    })

    observer.observe(contentEl)

    return () => {
      observer.disconnect()
    }
  }, [alwaysExpand, shouldCollapse])

  return (
    <div
      className={cn('relative text-left overflow-hidden', className)}
      ref={containerRef}
      {...props}
      style={{
        maxHeight: !shouldCollapse || expanded ? 'none' : `${collapsedHeight}px`
      }}
    >
      {children}
      {shouldCollapse && !expanded && (
        <div className="absolute bottom-0 h-40 w-full bg-gradient-to-b from-transparent to-background/90 flex items-end justify-center pb-4">
          <div
            className="bg-secondary"
            style={{ borderRadius: 'var(--button-radius, 6px)' }}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
            >
              {t('Show more')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
