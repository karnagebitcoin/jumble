import { useWidgets, TWidgetId } from '@/providers/WidgetsProvider'
import TrendingNotesWidget from '@/components/TrendingNotes/TrendingNotesWidget'
import BitcoinTickerWidget from '@/components/BitcoinTicker/BitcoinTickerWidget'
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
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const WIDGET_COMPONENTS: Record<TWidgetId, React.ComponentType> = {
  'bitcoin-ticker': BitcoinTickerWidget,
  'trending-notes': TrendingNotesWidget
}

function SortableWidget({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef
  } = useSortable({
    id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('relative group touch-none')}
    >
      {/* Drag handle - visible on hover */}
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={cn(
          'absolute -left-2 top-0 bottom-0 w-8 flex items-center justify-center',
          'opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10'
        )}
      >
        <div className="bg-background/90 backdrop-blur-sm rounded-md p-1.5 shadow-sm border">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Widget content - also draggable */}
      <div
        className={cn(
          'cursor-grab active:cursor-grabbing transition-all',
          isDragging && 'opacity-50 scale-95'
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default function Widgets() {
  const { enabledWidgets, reorderWidgets } = useWidgets()
  const [activeId, setActiveId] = useState<TWidgetId | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  if (enabledWidgets.length === 0) {
    return null
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as TWidgetId)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = enabledWidgets.indexOf(active.id as TWidgetId)
      const newIndex = enabledWidgets.indexOf(over.id as TWidgetId)
      const newOrder = arrayMove(enabledWidgets, oldIndex, newIndex)
      reorderWidgets(newOrder)
    }

    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={enabledWidgets} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {enabledWidgets.map((widgetId) => {
            const WidgetComponent = WIDGET_COMPONENTS[widgetId]
            if (!WidgetComponent) return null
            return (
              <SortableWidget key={widgetId} id={widgetId}>
                <WidgetComponent />
              </SortableWidget>
            )
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <div className="opacity-90 shadow-2xl scale-105 rotate-2">
            {(() => {
              const WidgetComponent = WIDGET_COMPONENTS[activeId]
              return WidgetComponent ? <WidgetComponent /> : null
            })()}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
