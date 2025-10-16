import PostEditor from '@/components/PostEditor'
import { cn } from '@/lib/utils'
import { useCompactSidebar } from '@/providers/CompactSidebarProvider'
import { useNostr } from '@/providers/NostrProvider'
import { PencilLine } from 'lucide-react'
import { useState } from 'react'
import SidebarItem from './SidebarItem'

export default function PostButton() {
  const { checkLogin } = useNostr()
  const [open, setOpen] = useState(false)
  const { compactSidebar } = useCompactSidebar()

  return (
    <div className="pt-4">
      <SidebarItem
        title="New post"
        description="Post"
        onClick={(e) => {
          e.stopPropagation()
          checkLogin(() => {
            setOpen(true)
          })
        }}
        variant="default"
        className={cn(
          "bg-primary gap-2",
          compactSidebar ? "" : "xl:justify-center"
        )}
      >
        <PencilLine strokeWidth={1.3} />
      </SidebarItem>
      <PostEditor open={open} setOpen={setOpen} />
    </div>
  )
}
