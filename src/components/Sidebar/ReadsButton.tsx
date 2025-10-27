import { BookOpen } from 'lucide-react'
import { usePrimaryPage } from '@/PageManager'
import SidebarItem from './SidebarItem'
import { useTranslation } from 'react-i18next'

export default function ReadsButton() {
  const { t } = useTranslation()
  const { navigate, current } = usePrimaryPage()

  return (
    <SidebarItem
      text={t('Reads')}
      isActive={current === 'reads'}
      icon={<BookOpen />}
      onClick={() => navigate('reads')}
    />
  )
}
