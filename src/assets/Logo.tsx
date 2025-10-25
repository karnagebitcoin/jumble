import { useTheme } from '@/providers/ThemeProvider'
import logoLight from '../../resources/logo-light.png'
import logoDark from '../../resources/logo-dark.png'

export default function Logo({ className }: { className?: string }) {
  const { theme } = useTheme()

  return (
    <img
      src={theme === 'dark' ? logoLight : logoDark}
      alt="Jumble Logo"
      className={className}
    />
  )
}
