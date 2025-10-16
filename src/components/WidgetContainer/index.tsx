import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type WidgetContainerProps = {
  children: ReactNode
  className?: string
}

export default function WidgetContainer({ children, className }: WidgetContainerProps) {
  return (
    <div className={cn('flex flex-col overflow-hidden', className)}>
      {children}
    </div>
  )
}
