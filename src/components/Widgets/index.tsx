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
  DragEndEvent
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

const WIDGET_COMPONENTS: Record<TWidgetId, React.ComponentType> = {
  'bitcoin-ticker': BitcoinTickerWidget,
  'trending-notes': TrendingNotesWidget
}

function SortableWidget({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('relative group', isDragging && 'z-50 opacity-50')}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 bg-background/80 backdrop-blur-sm rounded p-1"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {children}
    </div>
  )
}

export default function Widgets() {
  const { enabledWidgets, reorderWidgets } = useWidgets()

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

  if (enabledWidgets.length === 0) {
    return null
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = enabledWidgets.indexOf(active.id as TWidgetId)
      const newIndex = enabledWidgets.indexOf(over.id as TWidgetId)
      const newOrder = arrayMove(enabledWidgets, oldIndex, newIndex)
      reorderWidgets(newOrder)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
    </DndContext>
  )
}
