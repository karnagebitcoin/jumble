import { toSettings } from '@/lib/link'
import { useSecondaryPage } from '@/PageManager'
import { Settings } from 'lucide-react'
import SidebarItem from './SidebarItem'

export default function SettingsButton() {
  const { push } = useSecondaryPage()

  return (
    <SidebarItem title="Settings" onClick={() => push(toSettings())}>
      <Settings strokeWidth={1.3} />
    </SidebarItem>
  )
}
