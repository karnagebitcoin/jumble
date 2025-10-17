import { generateImageByPubkey } from '@/lib/pubkey'
import { useEffect, useMemo, useState } from 'react'
import Image from '../Image'
import { cn } from '@/lib/utils'

export default function ProfileBanner({
  pubkey,
  banner,
  className,
  onClick
}: {
  pubkey: string
  banner?: string
  className?: string
  onClick?: (event: React.MouseEvent) => void
}) {
  const defaultBanner = useMemo(() => generateImageByPubkey(pubkey), [pubkey])
  const [bannerUrl, setBannerUrl] = useState(banner ?? defaultBanner)

  useEffect(() => {
    if (banner) {
      setBannerUrl(banner)
    } else {
      setBannerUrl(defaultBanner)
    }
  }, [defaultBanner, banner])

  return (
    <Image
      image={{ url: bannerUrl, pubkey }}
      alt={`${pubkey} banner`}
      className={cn('rounded-none', className)}
      onError={() => setBannerUrl(defaultBanner)}
      onClick={onClick}
    />
  )
}
