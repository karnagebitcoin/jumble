import { usePrimaryPage } from '@/PageManager'
import { Compass } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SidebarItem from './SidebarItem'

export default function RelaysButton({ collapse }: { collapse: boolean }) {
  const { t } = useTranslation()
  const { navigate, current } = usePrimaryPage()

  return (
    <SidebarItem
      title={t('Explore')}
      onClick={() => navigate('explore')}
      active={current === 'explore'}
      collapse={collapse}
    >
      <Compass />
    </SidebarItem>
  )
}
