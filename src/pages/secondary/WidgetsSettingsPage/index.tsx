import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { AVAILABLE_WIDGETS, useWidgets, TWidgetId, TTrendingNotesHeight } from '@/providers/WidgetsProvider'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { forwardRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, GripVertical } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableWidgetCard({
  id,
  enabled,
  onToggle,
  trendingNotesHeight,
  onTrendingNotesHeightChange
}: {
  id: TWidgetId
  enabled: boolean
  onToggle: () => void
  trendingNotesHeight?: TTrendingNotesHeight
  onTrendingNotesHeightChange?: (height: TTrendingNotesHeight) => void
}) {
  const { t } = useTranslation()
  const widget = AVAILABLE_WIDGETS.find((w) => w.id === id)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  if (!widget) return null

  const showHeightSettings = id === 'trending-notes' && enabled

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative overflow-hidden rounded-xl border-2 transition-all duration-200 group touch-none',
        enabled
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing py-1"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center transition-colors cursor-pointer',
            enabled
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
          )}
          onClick={onToggle}
        >
          {widget.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
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
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Widget-specific settings */}
      {showHeightSettings && trendingNotesHeight && onTrendingNotesHeightChange && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50">
          <Label className="text-sm font-medium mb-2 block">Widget Height</Label>
          <RadioGroup
            value={trendingNotesHeight}
            onValueChange={onTrendingNotesHeightChange}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="short" id={`${id}-short`} />
              <Label htmlFor={`${id}-short`} className="cursor-pointer font-normal">
                Short (220px)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id={`${id}-medium`} />
              <Label htmlFor={`${id}-medium`} className="cursor-pointer font-normal">
                Medium (320px)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tall" id={`${id}-tall`} />
              <Label htmlFor={`${id}-tall`} className="cursor-pointer font-normal">
                Tall (480px)
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Active indicator bar */}
      {enabled && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
      )}
    </div>
  )
}

const WidgetsSettingsPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const {
    enabledWidgets,
    isWidgetEnabled,
    toggleWidget,
    reorderWidgets,
    trendingNotesHeight,
    setTrendingNotesHeight
  } = useWidgets()
  const [activeId, setActiveId] = useState<TWidgetId | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Create ordered list: enabled widgets first (in their order), then disabled widgets
  const orderedWidgets = [
    ...enabledWidgets,
    ...AVAILABLE_WIDGETS.filter((w) => !enabledWidgets.includes(w.id)).map((w) => w.id)
  ]

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as TWidgetId)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = orderedWidgets.indexOf(active.id as TWidgetId)
      const newIndex = orderedWidgets.indexOf(over.id as TWidgetId)
      const newOrder = arrayMove(orderedWidgets, oldIndex, newIndex)

      // Only update enabled widgets order
      const newEnabledOrder = newOrder.filter((id) => enabledWidgets.includes(id))
      reorderWidgets(newEnabledOrder)
    }

    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const activeWidget = activeId ? AVAILABLE_WIDGETS.find((w) => w.id === activeId) : null

  return (
    <SecondaryPageLayout ref={ref} index={index} title={t('Widgets')}>
      <div className="px-4 py-3 text-sm text-muted-foreground border-b">
        {t('Customize which widgets appear in your sidebar. Drag widgets to reorder them.')}
      </div>
      <div className="p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={orderedWidgets} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {orderedWidgets.map((widgetId) => (
                <SortableWidgetCard
                  key={widgetId}
                  id={widgetId}
                  enabled={isWidgetEnabled(widgetId)}
                  onToggle={() => toggleWidget(widgetId)}
                  trendingNotesHeight={trendingNotesHeight}
                  onTrendingNotesHeightChange={setTrendingNotesHeight}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeWidget ? (
              <div className="rounded-xl border-2 border-primary bg-primary/10 shadow-2xl opacity-90 p-4 flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  {activeWidget.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base">{t(activeWidget.name)}</h3>
                  <p className="text-sm text-muted-foreground">{t(activeWidget.description)}</p>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </SecondaryPageLayout>
  )
})
WidgetsSettingsPage.displayName = 'WidgetsSettingsPage'
export default WidgetsSettingsPage
