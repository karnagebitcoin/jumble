import { toSettings } from '@/lib/link'
import { useSecondaryPage } from '@/PageManager'
import { Settings } from 'lucide-react'
import SidebarItem from './SidebarItem'

export default function SettingsButton({ collapse }: { collapse: boolean }) {
  const { push } = useSecondaryPage()

  return (
    <SidebarItem title="Settings" onClick={() => push(toSettings())} collapse={collapse}>
      <Settings />
    </SidebarItem>
  )
}
